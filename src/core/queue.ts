import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
export type BatchStatus = "queued" | "claimed" | "working" | "response_ready" | "applied" | "awaiting_acceptance" | "resolved" | "failed" | "orphaned";
export type AdapterResultStatus = "applied" | "awaiting_acceptance" | "resolved";

export interface AgentReply { id: string; sender: "agent" | "human"; message: string; createdAt: string; }
export interface BatchClaim { bridgeId: string; leaseExpiresAt: string; }

export interface FeedbackBatch {
  recordType: "batch";
  id: string;
  workspaceId: string;
  workspacePath: string;
  sessionId: string;
  filePath: string;
  artifactClass: ArtifactClass;
  prompt: string;
  notes: FeedbackNote[];
  replies?: AgentReply[];
  status: BatchStatus;
  claim?: BatchClaim;
  approval?: { acceptedAt: string };
  result?: { summary: string; status: AdapterResultStatus | "failed"; proposal?: string };
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceStore { workspaceId: string; workspacePath: string; queuePath: string; metadataPath: string; }
type QueueRecord = FeedbackItem | FeedbackBatch;
const LOCK_STALE_MS = 60_000;

function canonicalPath(value: string): string {
  const absolute = path.resolve(value);
  try { return fs.realpathSync(absolute); } catch {
    const parent = path.dirname(absolute);
    if (parent === absolute) return absolute;
    return path.join(canonicalPath(parent), path.basename(absolute));
  }
}

export function getFeedbackRoot(): string { return path.join(os.homedir(), ".wc-view", "feedback"); }
export function getLegacyQueuePath(): string { return path.join(getFeedbackRoot(), "queue.jsonl"); }
export function getDefaultQueuePath(): string { return getWorkspaceStore(process.cwd()).queuePath; }

export function resolveWorkspacePath(inputPath: string): string {
  const canonical = canonicalPath(inputPath);
  let current = fs.existsSync(canonical) && fs.statSync(canonical).isFile() ? path.dirname(canonical) : canonical;
  const fallback = current;
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return fallback;
    current = parent;
  }
}

export function getWorkspaceStore(workspacePath: string): WorkspaceStore {
  const canonical = resolveWorkspacePath(workspacePath);
  const workspaceId = crypto.createHash("sha256").update(canonical).digest("hex");
  const directory = path.join(getFeedbackRoot(), "workspaces", workspaceId);
  return { workspaceId, workspacePath: canonical, queuePath: path.join(directory, "queue.jsonl"), metadataPath: path.join(directory, "workspace.json") };
}

export function initializeWorkspaceStore(workspacePath: string): WorkspaceStore {
  const store = getWorkspaceStore(workspacePath);
  fs.mkdirSync(path.dirname(store.queuePath), { recursive: true });
  fs.writeFileSync(store.metadataPath, `${JSON.stringify({ workspaceId: store.workspaceId, workspacePath: store.workspacePath }, null, 2)}\n`, "utf-8");
  return store;
}

export function listWorkspaceStores(): WorkspaceStore[] {
  const root = path.join(getFeedbackRoot(), "workspaces");
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((entry) => {
    const metadataPath = path.join(root, entry.name, "workspace.json");
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8")) as { workspaceId: string; workspacePath: string };
      return [{ ...metadata, queuePath: path.join(root, entry.name, "queue.jsonl"), metadataPath }];
    } catch { return []; }
  });
}

export function isBatch(record: QueueRecord): record is FeedbackBatch { return "recordType" in record && record.recordType === "batch"; }

function readRecords(queuePath: string): QueueRecord[] {
  if (!fs.existsSync(queuePath)) return [];
  const records = new Map<string, QueueRecord>();
  const malformed: number[] = [];
  const lines = fs.readFileSync(queuePath, "utf-8").split("\n");
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    try {
      const record = JSON.parse(line) as QueueRecord;
      if (record.id) records.set(record.id, record); else malformed.push(index + 1);
    } catch { malformed.push(index + 1); }
  });
  if (malformed.length) process.stderr.write(`wc-view queue: ignored malformed record line(s) ${malformed.join(", ")} in ${queuePath}\n`);
  return [...records.values()];
}

function lockIsStale(lockPath: string): boolean {
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf-8")) as { pid?: number; createdAt?: string };
    const old = !lock.createdAt || Date.now() - Date.parse(lock.createdAt) > LOCK_STALE_MS;
    if (!old) return false;
    if (lock.pid && lock.pid !== process.pid) {
      try { process.kill(lock.pid, 0); return false; }
      catch (error) { return (error as NodeJS.ErrnoException).code !== "EPERM"; }
    }
    return true;
  } catch { return Date.now() - fs.statSync(lockPath).mtimeMs > LOCK_STALE_MS; }
}

function withQueueLock<T>(queuePath: string, operation: () => T): T {
  fs.mkdirSync(path.dirname(queuePath), { recursive: true });
  const lockPath = `${queuePath}.lock`;
  let fd: number | undefined;
  const deadline = Date.now() + 5_000;
  for (;;) {
    if (fs.existsSync(lockPath) && lockIsStale(lockPath)) { try { fs.unlinkSync(lockPath); } catch {} }
    try { fd = fs.openSync(lockPath, "wx"); break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST" || Date.now() >= deadline) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
    }
  }
  try {
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
    return operation();
  } finally {
    if (fd !== undefined) {
      fs.closeSync(fd);
      try { fs.unlinkSync(lockPath); } catch {}
    }
  }
}

function writeRecords(records: QueueRecord[], queuePath: string): void {
  const jsonl = records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : "");
  const tmpPath = `${queuePath}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tmpPath, jsonl, "utf-8");
  fs.renameSync(tmpPath, queuePath);
}

export function readQueue(queuePath: string = getDefaultQueuePath()): FeedbackItem[] { return readRecords(queuePath).filter((record): record is FeedbackItem => !isBatch(record)); }
export function readBatches(queuePath: string = getDefaultQueuePath()): FeedbackBatch[] { return readRecords(queuePath).filter(isBatch); }

export function classifyArtifact(filePath: string, workspacePath: string): ArtifactClass {
  const absoluteFile = canonicalPath(filePath);
  const workspace = canonicalPath(workspacePath);
  const relative = path.relative(workspace, absoluteFile);
  const withinWorkspace = relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
  return withinWorkspace && /^\.wc-view-scratch[^/]*\.(md|html?)$/i.test(path.basename(absoluteFile)) ? "scratch" : "protected";
}

export function writeFeedbackItem(item: FeedbackItem, queuePath: string = getLegacyQueuePath()): FeedbackItem {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath);
    const existing = records.find((record) => !isBatch(record) && record.id === item.id) as FeedbackItem | undefined;
    const saved = { ...item, createdAt: existing?.createdAt || item.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    const index = records.findIndex((record) => record.id === saved.id);
    if (index >= 0) records[index] = saved; else records.push(saved);
    writeRecords(records, queuePath);
    return saved;
  });
}

export function createFeedbackBatch(
  input: { id?: string; filePath: string; prompt: string; notes: FeedbackNote[]; sessionId?: string },
  workspacePath: string,
  queuePath?: string
): FeedbackBatch {
  if (!input.prompt.trim() && input.notes.length === 0) throw new Error("A feedback batch requires a prompt or at least one note.");
  const store = queuePath ? getWorkspaceStore(workspacePath) : initializeWorkspaceStore(workspacePath);
  const targetQueue = queuePath ?? store.queuePath;
  return withQueueLock(targetQueue, () => {
    const records = readRecords(targetQueue);
    const id = input.id || `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const existing = records.find((record) => record.id === id);
    if (existing) {
      if (isBatch(existing)) return existing;
      throw new Error(`Feedback id ${id} is already used by a legacy note.`);
    }
    const now = new Date().toISOString();
    const batch: FeedbackBatch = {
      recordType: "batch", id, workspaceId: store.workspaceId, workspacePath: store.workspacePath,
      sessionId: input.sessionId || "legacy", filePath: canonicalPath(input.filePath),
      artifactClass: classifyArtifact(input.filePath, store.workspacePath), prompt: input.prompt, notes: input.notes,
      status: "queued", createdAt: now, updatedAt: now
    };
    records.push(batch); writeRecords(records, targetQueue); return batch;
  });
}

export function claimNextBatch(bridgeId: string, leaseMs = 30_000, queuePath: string = getDefaultQueuePath(), workspaceId?: string): FeedbackBatch | undefined {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath); const now = Date.now();
    const index = records.findIndex((record) => isBatch(record) && (!workspaceId || record.workspaceId === workspaceId) && (record.status === "queued" || (["claimed", "working"].includes(record.status) && (!record.claim || Date.parse(record.claim.leaseExpiresAt) <= now))));
    if (index < 0) return undefined;
    const current = records[index] as FeedbackBatch;
    const claimed = { ...current, status: "claimed" as const, claim: { bridgeId, leaseExpiresAt: new Date(now + leaseMs).toISOString() }, updatedAt: new Date(now).toISOString() };
    records[index] = claimed; writeRecords(records, queuePath); return claimed;
  });
}

export function updateBatch(id: string, update: Pick<FeedbackBatch, "status"> & Partial<Pick<FeedbackBatch, "result" | "claim">>, queuePath: string = getDefaultQueuePath(), ownerBridgeId?: string): FeedbackBatch | undefined {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath); const index = records.findIndex((record) => isBatch(record) && record.id === id);
    if (index < 0) return undefined;
    const existing = records[index] as FeedbackBatch;
    if (ownerBridgeId && existing.claim?.bridgeId !== ownerBridgeId) return undefined;
    const terminal = ["applied", "awaiting_acceptance", "resolved", "failed", "orphaned"].includes(update.status);
    const next = { ...existing, ...update, claim: terminal && update.claim === undefined ? undefined : update.claim ?? existing.claim, updatedAt: new Date().toISOString() };
    records[index] = next; writeRecords(records, queuePath); return next;
  });
}

export function renewBatchLease(id: string, bridgeId: string, leaseMs: number, queuePath: string = getDefaultQueuePath()): FeedbackBatch | undefined {
  return updateBatch(id, { status: "working", claim: { bridgeId, leaseExpiresAt: new Date(Date.now() + leaseMs).toISOString() } }, queuePath, bridgeId);
}

export function approveBatch(id: string, queuePath: string = getDefaultQueuePath(), expectedFilePath?: string): FeedbackBatch | undefined {
  return withQueueLock(queuePath, () => {
    const expected = expectedFilePath ? canonicalPath(expectedFilePath) : undefined;
    const records = readRecords(queuePath); const index = records.findIndex((record) => isBatch(record) && record.id === id && (!expected || record.filePath === expected));
    if (index < 0) return undefined;
    const existing = records[index] as FeedbackBatch;
    if (existing.status !== "awaiting_acceptance") throw new Error("Only a batch awaiting acceptance can be approved.");
    const approved = { ...existing, status: "queued" as const, approval: { acceptedAt: new Date().toISOString() }, updatedAt: new Date().toISOString() };
    records[index] = approved; writeRecords(records, queuePath); return approved;
  });
}

export function getUnresolvedItems(filePath?: string, queuePath: string = getLegacyQueuePath()): FeedbackItem[] {
  return readQueue(queuePath).filter((item) => item.status === "unresolved" && (!filePath || canonicalPath(item.filePath) === canonicalPath(filePath)));
}

export function getUnresolvedBatches(options: { target?: string; sessionId?: string } = {}, queuePath: string = getDefaultQueuePath()): FeedbackBatch[] {
  const target = options.target ? canonicalPath(options.target) : undefined;
  return readBatches(queuePath).filter((batch) => !["resolved", "applied"].includes(batch.status) && (!target || batch.filePath === target) && (!options.sessionId || batch.sessionId === options.sessionId));
}

export function resolveFeedbackItem(id: string, queuePath: string = getDefaultQueuePath()): { resolved: boolean; id: string; type: "item" | "batch" | "note" } | null {
  return withQueueLock(queuePath, () => {
    const records = readRecords(queuePath); const now = new Date().toISOString();
    const index = records.findIndex((record) => record.id === id);
    if (index >= 0) {
      const record = records[index];
      records[index] = isBatch(record) ? { ...record, status: "resolved", notes: record.notes.map((note) => ({ ...note, status: "resolved" })), updatedAt: now } : { ...record, status: "resolved", updatedAt: now };
      writeRecords(records, queuePath); return { resolved: true, id, type: isBatch(record) ? "batch" : "item" };
    }
    for (const record of records) if (isBatch(record)) {
      const note = record.notes.find((candidate) => candidate.id === id);
      if (note) { note.status = "resolved"; record.updatedAt = now; writeRecords(records, queuePath); return { resolved: true, id, type: "note" }; }
    }
    return null;
  });
}

export function addAgentReply(batchId: string, message: string, sender: "agent" | "human" = "agent", queuePath: string = getDefaultQueuePath(), expectedFilePath?: string): FeedbackBatch | null {
  if (!message.trim()) throw new Error("Reply message cannot be empty.");
  return withQueueLock(queuePath, () => {
    const expected = expectedFilePath ? canonicalPath(expectedFilePath) : undefined;
    const records = readRecords(queuePath); const index = records.findIndex((record) => isBatch(record) && record.id === batchId && (!expected || record.filePath === expected));
    if (index < 0) return null;
    const existing = records[index] as FeedbackBatch; const now = new Date().toISOString();
    const next = { ...existing, replies: [...(existing.replies || []), { id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, sender, message: message.trim(), createdAt: now }], updatedAt: now };
    records[index] = next; writeRecords(records, queuePath); return next;
  });
}

export function gcFeedback(options: { all?: boolean; days?: number } = {}, queuePath: string = getDefaultQueuePath()): number {
  if (!fs.existsSync(queuePath)) return 0;
  return withQueueLock(queuePath, () => {
    const cutoff = Date.now() - (options.days ?? 30) * 86_400_000; const records = readRecords(queuePath);
    const remaining = records.filter((record) => !["resolved", "applied"].includes(record.status) || (!options.all && Date.parse(record.updatedAt || record.createdAt) >= cutoff));
    const removed = records.length - remaining.length; if (removed) writeRecords(remaining, queuePath); return removed;
  });
}
