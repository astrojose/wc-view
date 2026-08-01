import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { AnchorData } from "../client/anchoring.js";

export interface FeedbackItem {
  id: string;
  filePath: string;
  anchor: AnchorData;
  comment: string;
  severity?: "info" | "warning" | "error";
  status: "unresolved" | "in_progress" | "resolved" | "orphaned";
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackNote {
  id: string;
  anchor: AnchorData;
  comment: string;
  severity?: "info" | "warning" | "error";
  status?: "unresolved" | "resolved" | "orphaned";
}

export type ArtifactClass = "scratch" | "protected";
export type BatchStatus =
  | "queued"
  | "claimed"
  | "working"
  | "response_ready"
  | "applied"
  | "awaiting_acceptance"
  | "resolved"
  | "failed"
  | "orphaned";
export type AdapterResultStatus = "applied" | "awaiting_acceptance" | "resolved";

export interface FeedbackBatch {
  recordType: "batch";
  id: string;
  filePath: string;
  artifactClass: ArtifactClass;
  prompt: string;
  notes: FeedbackNote[];
  status: BatchStatus;
  claim?: { bridgeId: string; leaseExpiresAt: string };
  approval?: { acceptedAt: string };
  result?: { summary: string; status: AdapterResultStatus | "failed"; proposal?: string };
  createdAt: string;
  updatedAt: string;
}

type QueueRecord = FeedbackItem | FeedbackBatch;

export function getDefaultQueuePath(): string {
  return path.join(os.homedir(), ".wc-view", "feedback", "queue.jsonl");
}

function isBatch(record: QueueRecord): record is FeedbackBatch {
  return "recordType" in record && record.recordType === "batch";
}

function readRecords(queuePath: string): QueueRecord[] {
  if (!fs.existsSync(queuePath)) return [];
  try {
    const records = new Map<string, QueueRecord>();
    for (const line of fs.readFileSync(queuePath, "utf-8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const record = JSON.parse(line) as QueueRecord;
        if (record.id) records.set(record.id, record);
      } catch {
        // Preserve usable records when a prior interrupted write left malformed data.
      }
    }
    return Array.from(records.values());
  } catch {
    return [];
  }
}

function withQueueLock<T>(queuePath: string, operation: () => T): T {
  const dir = path.dirname(queuePath);
  fs.mkdirSync(dir, { recursive: true });
  const lockPath = `${queuePath}.lock`;
  let fd: number | undefined;
  try {
    fd = fs.openSync(lockPath, "wx");
    return operation();
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
      try {
        fs.unlinkSync(lockPath);
      } catch {
        // The acquired lock was already removed during shutdown.
      }
    }
  }
}

function writeRecords(records: QueueRecord[], queuePath: string): void {
  const jsonl = records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : "");
  const tmpPath = `${queuePath}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmpPath, jsonl, "utf-8");
  fs.renameSync(tmpPath, queuePath);
}

export function readQueue(queuePath: string = getDefaultQueuePath()): FeedbackItem[] {
  return readRecords(queuePath).filter((record): record is FeedbackItem => !isBatch(record));
}

export function readBatches(queuePath: string = getDefaultQueuePath()): FeedbackBatch[] {
  return readRecords(queuePath).filter(isBatch);
}

export function classifyArtifact(filePath: string, workspacePath: string): ArtifactClass {
  const absoluteFile = path.resolve(filePath);
  const workspace = path.resolve(workspacePath);
  const relative = path.relative(workspace, absoluteFile);
  const withinWorkspace = relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
  const scratchName = /^\.wc-view-scratch[^/]*\.(md|html?)$/i.test(path.basename(absoluteFile));
  return withinWorkspace && scratchName ? "scratch" : "protected";
}

export function writeFeedbackItem(item: FeedbackItem, queuePath: string = getDefaultQueuePath()): FeedbackItem {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath);
    const existing = records.find((record) => !isBatch(record) && record.id === item.id) as FeedbackItem | undefined;
    const now = new Date().toISOString();
    const saved: FeedbackItem = {
      ...item,
      createdAt: existing?.createdAt || item.createdAt || now,
      updatedAt: now
    };
    const index = records.findIndex((record) => record.id === saved.id);
    if (index >= 0) records[index] = saved;
    else records.push(saved);
    writeRecords(records, queuePath);
    return saved;
  });
}

export function createFeedbackBatch(
  input: Omit<FeedbackBatch, "recordType" | "id" | "artifactClass" | "status" | "createdAt" | "updatedAt"> & { id?: string },
  workspacePath: string,
  queuePath: string = getDefaultQueuePath()
): FeedbackBatch {
  if (!input.prompt.trim() && input.notes.length === 0) {
    throw new Error("A feedback batch requires a prompt or at least one note.");
  }

  return withQueueLock(queuePath, () => {
    const now = new Date().toISOString();
    const id = input.id || `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const records = readRecords(queuePath);
    const existing = records.find((record) => record.id === id);
    if (existing) {
      if (isBatch(existing)) return existing;
      throw new Error(`Feedback id ${id} is already used by a legacy note.`);
    }
    const batch: FeedbackBatch = {
      recordType: "batch",
      id,
      filePath: path.resolve(input.filePath),
      artifactClass: classifyArtifact(input.filePath, workspacePath),
      prompt: input.prompt,
      notes: input.notes,
      status: "queued",
      createdAt: now,
      updatedAt: now
    };
    records.push(batch);
    writeRecords(records, queuePath);
    return batch;
  });
}

export function claimNextBatch(
  bridgeId: string,
  leaseMs: number = 30_000,
  queuePath: string = getDefaultQueuePath()
): FeedbackBatch | undefined {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath);
    const now = Date.now();
    const index = records.findIndex((record) => {
      if (!isBatch(record)) return false;
      const expired = record.status === "claimed" && record.claim && Date.parse(record.claim.leaseExpiresAt) <= now;
      return record.status === "queued" || expired;
    });
    if (index < 0) return undefined;

    const current = records[index] as FeedbackBatch;
    const claimed: FeedbackBatch = {
      ...current,
      status: "claimed",
      claim: { bridgeId, leaseExpiresAt: new Date(now + leaseMs).toISOString() },
      updatedAt: new Date(now).toISOString()
    };
    records[index] = claimed;
    writeRecords(records, queuePath);
    return claimed;
  });
}

export function updateBatch(
  id: string,
  update: Pick<FeedbackBatch, "status"> & Partial<Pick<FeedbackBatch, "result" | "claim">>,
  queuePath: string = getDefaultQueuePath()
): FeedbackBatch | undefined {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath);
    const index = records.findIndex((record) => isBatch(record) && record.id === id);
    if (index < 0) return undefined;
    const existing = records[index] as FeedbackBatch;
    const next: FeedbackBatch = {
      ...existing,
      ...update,
      claim: update.claim === undefined && ["applied", "awaiting_acceptance", "resolved", "failed", "orphaned"].includes(update.status)
        ? undefined
        : update.claim === undefined ? existing.claim : update.claim,
      updatedAt: new Date().toISOString()
    };
    records[index] = next;
    writeRecords(records, queuePath);
    return next;
  });
}

export function approveBatch(id: string, queuePath: string = getDefaultQueuePath()): FeedbackBatch | undefined {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath);
    const index = records.findIndex((record) => isBatch(record) && record.id === id);
    if (index < 0) return undefined;
    const existing = records[index] as FeedbackBatch;
    if (existing.status !== "awaiting_acceptance") {
      throw new Error("Only a batch awaiting acceptance can be approved.");
    }
    const approved: FeedbackBatch = {
      ...existing,
      status: "queued",
      approval: { acceptedAt: new Date().toISOString() },
      updatedAt: new Date().toISOString()
    };
    records[index] = approved;
    writeRecords(records, queuePath);
    return approved;
  });
}

export function getUnresolvedItems(filePath?: string, queuePath: string = getDefaultQueuePath()): FeedbackItem[] {
  return readQueue(queuePath).filter((item) => {
    const matchesFile = !filePath || item.filePath === filePath || path.basename(item.filePath) === path.basename(filePath);
    return item.status === "unresolved" && matchesFile;
  });
}

export function gcFeedback(options: { all?: boolean; days?: number } = {}, queuePath: string = getDefaultQueuePath()): number {
  if (!fs.existsSync(queuePath)) return 0;
  return withQueueLock(queuePath, () => {
    const cutoff = Date.now() - (options.days ?? 30) * 24 * 60 * 60 * 1000;
    const terminal = new Set(["resolved", "applied"]);
    const records = readRecords(queuePath);
    const remaining = records.filter((record) => {
      const status = record.status;
      if (!terminal.has(status)) return true;
      if (options.all) return false;
      return Date.parse(record.updatedAt || record.createdAt) >= cutoff;
    });
    const removed = records.length - remaining.length;
    if (removed > 0) writeRecords(remaining, queuePath);
    return removed;
  });
}
