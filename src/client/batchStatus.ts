export function getBatchSubmitStatus(prompt: string, noteCount: number): string {
  const hasPrompt = prompt.trim().length > 0;

  if (noteCount === 0 && !hasPrompt) {
    return "No queued notes or instruction to submit.";
  }

  const noteLabel = `${noteCount} note${noteCount === 1 ? "" : "s"}`;
  const instructionLabel = hasPrompt ? " + instruction" : "";
  return `Submitted ${noteLabel}${instructionLabel} to the feedback queue.`;
}
