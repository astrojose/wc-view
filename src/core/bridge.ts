import { spawnSync } from "node:child_process";
import { claimNextBatch, FeedbackBatch, updateBatch } from "./queue.js";

export interface BridgeOptions {
  command: string;
  bridgeId: string;
  intervalMs?: number;
  queuePath?: string;
}

interface AdapterResult {
  summary: string;
  status: "applied" | "awaiting_acceptance" | "resolved";
  proposal?: string;
}

function parseAdapterResult(stdout: string): AdapterResult {
  const result = JSON.parse(stdout.trim()) as AdapterResult;
  if (!result.summary || !["applied", "awaiting_acceptance", "resolved"].includes(result.status)) {
    throw new Error("Adapter must return JSON with a summary and valid status.");
  }
  return result;
}

export function dispatchClaimedBatch(batch: FeedbackBatch, command: string, queuePath?: string): FeedbackBatch | undefined {
  updateBatch(batch.id, { status: "working" }, queuePath);
  const result = spawnSync(command, {
    shell: true,
    input: `${JSON.stringify(batch)}\n`,
    encoding: "utf-8",
    env: {
      ...process.env,
      WC_VIEW_BATCH_ID: batch.id,
      WC_VIEW_ARTIFACT_CLASS: batch.artifactClass,
      WC_VIEW_TARGET_PATH: batch.filePath
    }
  });

  if (result.error || result.status !== 0) {
    const detail = result.stderr?.trim() || result.error?.message || `Adapter exited with code ${result.status}`;
    return updateBatch(batch.id, { status: "failed", result: { summary: detail, status: "failed" } }, queuePath);
  }

  try {
    const adapterResult = parseAdapterResult(result.stdout);
    const protectedStatus = batch.artifactClass === "protected" && !batch.approval ? "awaiting_acceptance" : adapterResult.status;
    const summary = batch.artifactClass === "protected" && !batch.approval && adapterResult.status === "applied"
      ? `${adapterResult.summary} (protected target: awaiting your acceptance)`
      : adapterResult.summary;
    return updateBatch(batch.id, {
      status: protectedStatus,
      result: { summary, status: protectedStatus, proposal: adapterResult.proposal || summary }
    }, queuePath);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Adapter returned an invalid result.";
    return updateBatch(batch.id, { status: "failed", result: { summary: detail, status: "failed" } }, queuePath);
  }
}

export function runBridgeOnce(options: BridgeOptions): FeedbackBatch | undefined {
  const batch = claimNextBatch(options.bridgeId, 30_000, options.queuePath);
  return batch ? dispatchClaimedBatch(batch, options.command, options.queuePath) : undefined;
}

export function startBridge(options: BridgeOptions): () => void {
  const intervalMs = options.intervalMs ?? 500;
  let running = false;
  const tick = () => {
    if (running) return;
    running = true;
    try {
      runBridgeOnce(options);
    } finally {
      running = false;
    }
  };
  tick();
  const timer = setInterval(tick, intervalMs);
  return () => clearInterval(timer);
}
