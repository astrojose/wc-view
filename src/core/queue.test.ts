import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  claimNextBatch,
  createFeedbackBatch,
  getUnresolvedItems,
  gcFeedback,
  readBatches,
  readQueue,
  writeFeedbackItem,
  FeedbackItem
} from "./queue.js";

const anchor = {
  primary: { exact: "Node.js 18+ ESM", prefix: "", suffix: "" },
  secondary: { headingSlug: "tech", elementType: "p", occurrenceIndex: 0 },
  tertiary: { offsetHint: 0 }
};

describe("Feedback Queue Manager", () => {
  let tmpDir: string;
  let testQueuePath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wc-view-test-"));
    testQueuePath = path.join(tmpDir, "queue.jsonl");
  });

  afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const sampleItem: FeedbackItem = {
    id: "fb_001",
    filePath: "docs/design/tech-stack.md",
    anchor,
    comment: "Update Node.js requirement details",
    severity: "info",
    status: "unresolved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it("writes and updates legacy feedback without removing batches", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    const batch = createFeedbackBatch({ filePath: path.join(tmpDir, ".wc-view-scratch.md"), prompt: "Improve it", notes: [] }, tmpDir, testQueuePath);
    writeFeedbackItem({ ...sampleItem, comment: "Updated comment text", status: "resolved" }, testQueuePath);

    expect(readQueue(testQueuePath)).toEqual([expect.objectContaining({ comment: "Updated comment text" })]);
    expect(readBatches(testQueuePath)).toEqual([expect.objectContaining({ id: batch.id, status: "queued" })]);
  });

  it("creates one classified batch containing its prompt and every note", () => {
    const batch = createFeedbackBatch({
      filePath: path.join(tmpDir, ".wc-view-scratch-training.md"),
      prompt: "Improve the training",
      notes: [{ id: "note_1", anchor, comment: "Make the handoff explicit" }, { id: "note_2", anchor, comment: "Add a live demo" }]
    }, tmpDir, testQueuePath);

    expect(batch.artifactClass).toBe("scratch");
    expect(batch.notes).toHaveLength(2);
    expect(batch.status).toBe("queued");
    expect(readBatches(testQueuePath)).toHaveLength(1);
    const retried = createFeedbackBatch({
      id: batch.id,
      filePath: path.join(tmpDir, ".wc-view-scratch-training.md"),
      prompt: "A retry must not replace this batch",
      notes: []
    }, tmpDir, testQueuePath);
    expect(retried).toEqual(batch);
  });

  it("classifies HTML scratch artifacts as scratch", () => {
    const batch = createFeedbackBatch({
      filePath: path.join(tmpDir, ".wc-view-scratch-flow.html"),
      prompt: "Restyle the flow",
      notes: []
    }, tmpDir, testQueuePath);

    expect(batch.artifactClass).toBe("scratch");
  });

  it("claims each batch once until its lease expires", () => {
    createFeedbackBatch({ filePath: path.join(tmpDir, "docs.md"), prompt: "Review", notes: [] }, tmpDir, testQueuePath);
    const first = claimNextBatch("bridge_a", 30_000, testQueuePath);
    const second = claimNextBatch("bridge_b", 30_000, testQueuePath);

    expect(first).toMatchObject({ status: "claimed", claim: { bridgeId: "bridge_a" } });
    expect(second).toBeUndefined();
  });

  it("filters unresolved legacy items and garbage collects terminal records", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    writeFeedbackItem({ ...sampleItem, id: "fb_002", status: "resolved" }, testQueuePath);
    expect(getUnresolvedItems(undefined, testQueuePath)).toHaveLength(1);
    expect(gcFeedback({ all: true }, testQueuePath)).toBe(1);
    expect(readQueue(testQueuePath)).toHaveLength(1);
  });
});
