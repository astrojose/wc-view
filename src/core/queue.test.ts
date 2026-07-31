import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { readQueue, writeFeedbackItem, getUnresolvedItems, gcFeedback, FeedbackItem } from "./queue.js";

describe("Feedback Queue Manager", () => {
  let tmpDir: string;
  let testQueuePath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wc-view-test-"));
    testQueuePath = path.join(tmpDir, "queue.jsonl");
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  const sampleItem: FeedbackItem = {
    id: "fb_001",
    filePath: "docs/design/tech-stack.md",
    anchor: {
      primary: { exact: "Node.js 18+ ESM", prefix: "", suffix: "" },
      secondary: { headingSlug: "tech", elementType: "p", occurrenceIndex: 0 },
      tertiary: { offsetHint: 0 }
    },
    comment: "Update Node.js requirement details",
    severity: "info",
    status: "unresolved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it("writes and reads feedback items cleanly", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    const items = readQueue(testQueuePath);

    expect(items.length).toBe(1);
    expect(items[0].id).toBe("fb_001");
    expect(items[0].comment).toBe("Update Node.js requirement details");
  });

  it("updates existing feedback item by ID", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    const updated = { ...sampleItem, comment: "Updated comment text", status: "resolved" as const };
    writeFeedbackItem(updated, testQueuePath);

    const items = readQueue(testQueuePath);
    expect(items.length).toBe(1);
    expect(items[0].comment).toBe("Updated comment text");
    expect(items[0].status).toBe("resolved");
  });

  it("filters unresolved items", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    const resolvedItem: FeedbackItem = {
      ...sampleItem,
      id: "fb_002",
      status: "resolved"
    };
    writeFeedbackItem(resolvedItem, testQueuePath);

    const unresolved = getUnresolvedItems(undefined, testQueuePath);
    expect(unresolved.length).toBe(1);
    expect(unresolved[0].id).toBe("fb_001");
  });

  it("garbage collects resolved items with --all", () => {
    writeFeedbackItem(sampleItem, testQueuePath);
    const resolvedItem: FeedbackItem = {
      ...sampleItem,
      id: "fb_002",
      status: "resolved"
    };
    writeFeedbackItem(resolvedItem, testQueuePath);

    const removed = gcFeedback({ all: true }, testQueuePath);
    expect(removed).toBe(1);

    const remaining = readQueue(testQueuePath);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe("fb_001");
  });
});
