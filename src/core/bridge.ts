import { spawn } from "node:child_process";
import { claimNextBatch, FeedbackBatch, getWorkspaceStore, renewBatchLease, updateBatch } from "./queue.js";

export interface BridgeOptions {
  command: string;
  bridgeId: string;
  workspacePath: string;
  intervalMs?: number;
  leaseMs?: number;
  queuePath?: string;
  signal?: AbortSignal;
}

const MIN_LEASE_MS = 150;

interface AdapterResult { summary: string; status: "applied" | "awaiting_acceptance" | "resolved"; proposal?: string; }
interface AdapterEnvelope {
  batch: Omit<FeedbackBatch, "filePath"> & { filePath?: string };
  policy: { mode: "apply" | "proposal_only"; targetPath?: string };
}

function parseAdapterResult(stdout: string): AdapterResult {
  const result = JSON.parse(stdout.trim()) as AdapterResult;
  if (!result.summary || !["applied", "awaiting_acceptance", "resolved"].includes(result.status)) throw new Error("Adapter must return JSON with a summary and valid status.");
  return result;
}

export function createAdapterEnvelope(batch: FeedbackBatch): AdapterEnvelope {
  const proposalOnly = batch.artifactClass === "protected" && !batch.approval;
  if (!proposalOnly) return { batch, policy: { mode: "apply", targetPath: batch.filePath } };
  const { filePath: _filePath, ...safeBatch } = batch;
  return { batch: safeBatch, policy: { mode: "proposal_only" } };
}

export async function dispatchClaimedBatch(batch: FeedbackBatch, options: BridgeOptions): Promise<FeedbackBatch | undefined> {
  const queuePath = options.queuePath ?? getWorkspaceStore(options.workspacePath).queuePath;
  const leaseMs = Math.max(MIN_LEASE_MS, options.leaseMs ?? 30_000);
  if (!updateBatch(batch.id, { status: "working" }, queuePath, options.bridgeId)) return undefined;

  const envelope = createAdapterEnvelope(batch);
  const child = spawn(options.command, { shell: true, stdio: ["pipe", "pipe", "pipe"], env: {
    ...process.env,
    WC_VIEW_BATCH_ID: batch.id,
    WC_VIEW_ARTIFACT_CLASS: batch.artifactClass,
    WC_VIEW_POLICY_MODE: envelope.policy.mode,
    ...(envelope.policy.targetPath ? { WC_VIEW_TARGET_PATH: envelope.policy.targetPath } : {})
  }});
  child.stdin.end(`${JSON.stringify(envelope)}\n`);
  const abort = () => child.kill("SIGTERM");
  options.signal?.addEventListener("abort", abort, { once: true });
  let stdout = ""; let stderr = "";
  child.stdout.setEncoding("utf-8"); child.stderr.setEncoding("utf-8");
  child.stdout.on("data", (chunk: string) => { stdout += chunk; });
  child.stderr.on("data", (chunk: string) => { stderr += chunk; });

  const renewal = setInterval(() => renewBatchLease(batch.id, options.bridgeId, leaseMs, queuePath), Math.max(25, Math.floor(leaseMs / 3)));
  const outcome = await new Promise<{ code: number | null; error?: Error }>((resolve) => {
    child.once("error", (error) => resolve({ code: null, error }));
    child.once("close", (code) => resolve({ code }));
  });
  clearInterval(renewal);
  options.signal?.removeEventListener("abort", abort);

  if (outcome.error || outcome.code !== 0) {
    const detail = stderr.trim() || outcome.error?.message || `Adapter exited with code ${outcome.code}`;
    return updateBatch(batch.id, { status: "failed", result: { summary: detail, status: "failed" } }, queuePath, options.bridgeId);
  }

  try {
    const adapterResult = parseAdapterResult(stdout);
    const proposalOnly = envelope.policy.mode === "proposal_only";
    const status = proposalOnly ? "awaiting_acceptance" : adapterResult.status;
    const summary = proposalOnly && adapterResult.status === "applied" ? `${adapterResult.summary} (protected target: awaiting your acceptance)` : adapterResult.summary;
    return updateBatch(batch.id, { status, result: { summary, status, proposal: adapterResult.proposal || summary } }, queuePath, options.bridgeId);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Adapter returned an invalid result.";
    return updateBatch(batch.id, { status: "failed", result: { summary: detail, status: "failed" } }, queuePath, options.bridgeId);
  }
}

export async function runBridgeOnce(options: BridgeOptions): Promise<FeedbackBatch | undefined> {
  const store = getWorkspaceStore(options.workspacePath);
  const queuePath = options.queuePath ?? store.queuePath;
  const leaseMs = Math.max(MIN_LEASE_MS, options.leaseMs ?? 30_000);
  const batch = claimNextBatch(options.bridgeId, leaseMs, queuePath, store.workspaceId);
  return batch ? dispatchClaimedBatch(batch, { ...options, queuePath }) : undefined;
}

export function startBridge(options: BridgeOptions): () => Promise<void> {
  let stopped = false;
  let inFlight: Promise<void> | undefined;
  const controller = new AbortController();
  const tick = (): void => {
    if (inFlight || stopped) return;
    inFlight = runBridgeOnce({ ...options, signal: controller.signal }).then(() => undefined).finally(() => { inFlight = undefined; });
  };
  tick();
  const timer = setInterval(tick, options.intervalMs ?? 500);
  return async () => {
    stopped = true;
    clearInterval(timer);
    controller.abort();
    await inFlight;
  };
}
