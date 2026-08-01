export function getBatchSubmitStatus(prompt: string, noteCount: number): string {
  if (!prompt.trim() && noteCount === 0) return "No queued notes or instruction to send.";
  const noteLabel = `${noteCount} note${noteCount === 1 ? "" : "s"}`;
  const instructionLabel = prompt.trim() ? `${noteCount ? " and " : ""}instruction` : "";
  return `Sent ${noteLabel}${instructionLabel} to the agent work queue.`;
}
