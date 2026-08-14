import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  addAgentReply,
  claimNextBatch,
  createFeedbackBatch,
  getUnresolvedItems,
  gcFeedback,
  readBatches,
  readQueue,
  resolveFeedbackItem,
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

  it("resolves feedback items, batches, and individual notes by id", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    const itemRes = resolveFeedbackItem("fb_001", testQueuePath);
    expect(itemRes).toEqual({ resolved: true, id: "fb_001", type: "item" });
    expect(getUnresolvedItems(undefined, testQueuePath)).toHaveLength(0);

    const batch = createFeedbackBatch({
      filePath: path.join(tmpDir, "docs.md"),
      prompt: "Fix formatting",
      notes: [{ id: "n_001", anchor, comment: "Fix typo" }]
    }, tmpDir, testQueuePath);

    const noteRes = resolveFeedbackItem("n_001", testQueuePath);
    expect(noteRes).toEqual({ resolved: true, id: "n_001", type: "note" });

    const batchRes = resolveFeedbackItem(batch.id, testQueuePath);
    expect(batchRes).toEqual({ resolved: true, id: batch.id, type: "batch" });
    expect(readBatches(testQueuePath)[0].status).toBe("resolved");
  });

  it("appends agent replies to an existing feedback batch", () => {
    const batch = createFeedbackBatch({
      filePath: path.join(tmpDir, "spec.md"),
      prompt: "Add tests",
      notes: []
    }, tmpDir, testQueuePath);

    const updated = addAgentReply(batch.id, "Added test cases and updated architecture docs", "agent", testQueuePath);
    expect(updated).not.toBeNull();
    expect(updated?.replies).toHaveLength(1);
    expect(updated?.replies?.[0]).toMatchObject({
      sender: "agent",
      message: "Added test cases and updated architecture docs"
    });

    const refreshed = readBatches(testQueuePath)[0];
    expect(refreshed.replies).toHaveLength(1);
  });
});


