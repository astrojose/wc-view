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

/**
 * Returns default queue storage path under ~/.wc-view/feedback/queue.jsonl
 */
export function getDefaultQueuePath(): string {
  return path.join(os.homedir(), ".wc-view", "feedback", "queue.jsonl");
}

/**
 * Reads all feedback items from JSONL queue file, returning map folded by ID.
 */
export function readQueue(queuePath: string = getDefaultQueuePath()): FeedbackItem[] {
  if (!fs.existsSync(queuePath)) return [];
  try {
    const raw = fs.readFileSync(queuePath, "utf-8");
    const lines = raw.split("\n").filter((line) => line.trim().length > 0);
    const itemMap = new Map<string, FeedbackItem>();

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line) as FeedbackItem;
        if (parsed.id) {
          itemMap.set(parsed.id, parsed);
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    return Array.from(itemMap.values());
  } catch {
    return [];
  }
}

/**
 * Writes or updates a feedback item in the JSONL queue.
 */
export function writeFeedbackItem(item: FeedbackItem, queuePath: string = getDefaultQueuePath()): FeedbackItem {
  const dir = path.dirname(queuePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const items = readQueue(queuePath);
  const existingIdx = items.findIndex((i) => i.id === item.id);
  const now = new Date().toISOString();

  const newItem: FeedbackItem = {
    ...item,
    createdAt: existingIdx >= 0 ? items[existingIdx].createdAt : item.createdAt || now,
    updatedAt: now
  };

  if (existingIdx >= 0) {
    items[existingIdx] = newItem;
  } else {
    items.push(newItem);
  }

  const jsonl = items.map((i) => JSON.stringify(i)).join("\n") + "\n";
  const tmpPath = `${queuePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpPath, jsonl, "utf-8");
  fs.renameSync(tmpPath, queuePath);

  return newItem;
}

/**
 * Filter unresolved items from queue.
 */
export function getUnresolvedItems(filePath?: string, queuePath: string = getDefaultQueuePath()): FeedbackItem[] {
  const items = readQueue(queuePath);
  return items.filter((item) => {
    const isUnresolved = item.status === "unresolved";
    const matchesFile = !filePath || item.filePath === filePath || path.basename(item.filePath) === path.basename(filePath);
    return isUnresolved && matchesFile;
  });
}

/**
 * Purges resolved items per retention threshold or all resolved items if all=true.
 */
export function gcFeedback(options: { all?: boolean; days?: number } = {}, queuePath: string = getDefaultQueuePath()): number {
  if (!fs.existsSync(queuePath)) return 0;
  const items = readQueue(queuePath);
  const days = options.days ?? 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const initialCount = items.length;
  const remaining = items.filter((item) => {
    if (item.status !== "resolved") return true;
    if (options.all) return false;
    const itemTime = new Date(item.updatedAt || item.createdAt).getTime();
    return itemTime >= cutoff;
  });

  const removedCount = initialCount - remaining.length;
  if (removedCount > 0) {
    const jsonl = remaining.map((i) => JSON.stringify(i)).join("\n") + (remaining.length ? "\n" : "");
    const tmpPath = `${queuePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, jsonl, "utf-8");
    fs.renameSync(tmpPath, queuePath);
  }

  return removedCount;
}
