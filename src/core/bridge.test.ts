import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runBridgeOnce } from "./bridge.js";
import { approveBatch, claimNextBatch, createFeedbackBatch, readBatches } from "./queue.js";

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

  it("dispatches a scratch batch and records the adapter result", async () => {
    fs.writeFileSync(adapterPath, 'process.stdout.write(JSON.stringify({summary: "Scratch artifact updated", status: "applied"}))');
    const batch = createFeedbackBatch({ filePath: path.join(tmpDir, ".wc-view-scratch.md"), prompt: "Improve", notes: [] }, tmpDir, queuePath);

    const result = await runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "test", workspacePath: tmpDir, queuePath });

    expect(result).toMatchObject({ id: batch.id, status: "applied", result: { summary: "Scratch artifact updated" } });
  });

  it("runs asynchronously and renews ownership during long adapter work", async () => {
    fs.writeFileSync(adapterPath, 'setTimeout(() => process.stdout.write(JSON.stringify({summary: "Done", status: "applied"})), 180)');
    createFeedbackBatch({ filePath: path.join(tmpDir, ".wc-view-scratch.md"), prompt: "Improve", notes: [] }, tmpDir, queuePath);
    let timerRan = false;
    setTimeout(() => { timerRan = true; }, 10);

    const work = runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "bridge_a", workspacePath: tmpDir, queuePath, leaseMs: 60 });
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(timerRan).toBe(true);
    expect(claimNextBatch("bridge_b", 60, queuePath)).toBeUndefined();
    await expect(work).resolves.toMatchObject({ status: "applied" });
  });

  it("prevents an adapter from automatically applying a protected batch", async () => {
    fs.writeFileSync(adapterPath, 'process.stdout.write(JSON.stringify({summary: "Proposed edit", status: "applied"}))');
    createFeedbackBatch({ filePath: path.join(tmpDir, "design.md"), prompt: "Improve", notes: [] }, tmpDir, queuePath);

    await runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "test", workspacePath: tmpDir, queuePath });

    const awaiting = readBatches(queuePath)[0];
    expect(awaiting).toMatchObject({
      artifactClass: "protected",
      status: "awaiting_acceptance",
      result: { status: "awaiting_acceptance" }
    });

    approveBatch(awaiting.id, queuePath);
    await runBridgeOnce({ command: `${JSON.stringify(process.execPath)} ${JSON.stringify(adapterPath)}`, bridgeId: "test", workspacePath: tmpDir, queuePath });
    expect(readBatches(queuePath)[0]).toMatchObject({ status: "applied", approval: expect.any(Object) });
  });
});
