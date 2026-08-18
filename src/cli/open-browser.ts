import { spawn } from "node:child_process";

export function getBrowserOpenCommand(url: string, platform = process.platform): { command: string; args: string[] } {
  if (platform === "darwin") return { command: "open", args: [url] };
  if (platform === "win32") return { command: "cmd", args: ["/c", "start", "", url] };
  return { command: "xdg-open", args: [url] };
}

export function openDefaultBrowser(url: string): void {
  const { command, args } = getBrowserOpenCommand(url);
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", (error) => {
    process.stderr.write(`wc-view serve: Could not open the default browser - ${error.message}\n`);
  });
  child.unref();
}
