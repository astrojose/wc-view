import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runBridgeOnce } from "./bridge.js";
import { approveBatch, createFeedbackBatch, readBatches } from "./queue.js";

describe("agent bridge", () => {
  let tmpDir: string;
  let queuePath: string;
  let adapterPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wc-view-bridge-test-"));
    queuePath = path.join(tmpDir, "queue.jsonl");
    adapterPath = path.join(tmpDir, "adapter.mjs");
  });

  afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  it("dispatches a scratch batch and records the adapter result", () => {
    fs.writeFileSync(adapterPath, 'process.stdout.write(JSON.stringify({summary: "Scratch artifact updated", status: "applied"}))');
    const batch = createFeedbackBatch({ filePath: path.join(tmpDir, ".wc-view-scratch.md"), prompt: "Improve", notes: [] }, tmpDir, queuePath);

    const result = runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "test", queuePath });

    expect(result).toMatchObject({ id: batch.id, status: "applied", result: { summary: "Scratch artifact updated" } });
  });

  it("prevents an adapter from automatically applying a protected batch", () => {
    fs.writeFileSync(adapterPath, 'process.stdout.write(JSON.stringify({summary: "Proposed edit", status: "applied"}))');
    createFeedbackBatch({ filePath: path.join(tmpDir, "design.md"), prompt: "Improve", notes: [] }, tmpDir, queuePath);

    runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "test", queuePath });

    const awaiting = readBatches(queuePath)[0];
    expect(awaiting).toMatchObject({
      artifactClass: "protected",
      status: "awaiting_acceptance",
      result: { status: "awaiting_acceptance" }
    });

    approveBatch(awaiting.id, queuePath);
    runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "test", queuePath });
    expect(readBatches(queuePath)[0]).toMatchObject({ status: "applied", approval: expect.any(Object) });
  });
});
