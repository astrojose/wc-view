#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import { createServer } from "../server/index.js";
import { getUnresolvedItems, gcFeedback, FeedbackItem } from "../core/queue.js";
import { runBridgeOnce, startBridge } from "../core/bridge.js";

const program = new Command();

program
  .name("wc-view")
  .description("Local Markdown review surface for agent workflows")
  .version("0.3.0");

program.exitOverride();
program.configureOutput({ writeErr: () => {} });
program.addHelpText("beforeAll", "bin: ~/.local/bin/wc-view\ndescription: Local Markdown review surface for agent workflows\n");

program
  .command("serve [path]")
  .description("Render Markdown files or a docs/ tree in a lightweight localhost browser UI")
  .option("-p, --port <number>", "Port to bind localhost server", "3456")
  .option("-H, --host <string>", "Host interface to bind", "127.0.0.1")
  .option("--agent-command <command>", "Start a local agent bridge with this adapter command")
  .action((targetPath, options) => {
    const port = parseInt(options.port, 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new CommanderError(2, "wc-view.invalidPort", "wc-view serve requires --port between 1 and 65535");
    }
    const host = options.host;
    if (host !== "127.0.0.1" && host !== "localhost") {
      throw new CommanderError(2, "wc-view.invalidHost", "wc-view serve only supports 127.0.0.1 loopback binding");
    }
    const server = createServer({ port, host: "127.0.0.1", targetPath });
    let stopBridge: (() => void) | undefined;
    if (options.agentCommand) {
      stopBridge = startBridge({
        command: options.agentCommand,
        bridgeId: `serve_${process.pid}`
      });
    }
    const shutdown = () => {
      stopBridge?.();
      server.close(() => process.exit(0));
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    server.listen(port, "127.0.0.1", () => {
      process.stderr.write(`wc-view serve: Localhost server active on http://127.0.0.1:${port}\n`);
      if (options.agentCommand) process.stderr.write("wc-view serve: Local agent bridge active.\n");
    });
  });

program
  .command("feedback")
  .description("Pull structured review feedback payloads for agent consumption")
  .option("-u, --unresolved", "Filter to unresolved feedback items", true)
  .option("-f, --format <type>", "Output payload format (json|toon)", "json")
  .action((options) => {
    const items = getUnresolvedItems();
    if (options.format === "json") {
      process.stdout.write(`${JSON.stringify({ version: "1.0", total: items.length, items }, null, 2)}\n`);
      return;
    }
    if (items.length === 0) {
      process.stdout.write("feedback: 0 unresolved items\n");
      return;
    }
    process.stdout.write(`count: ${items.length} unresolved\nfeedback[${items.length}]{id,status,filePath}:\n`);
    items.forEach((item: FeedbackItem) => process.stdout.write(`  "${item.id}","${item.status}","${item.filePath}"\n`));
  });

program
  .command("bridge")
  .description("Claim feedback batches and dispatch them to a local agent adapter")
  .requiredOption("--command <command>", "Adapter command; receives one FeedbackBatch JSON object on stdin")
  .option("--interval <ms>", "Queue polling interval", "500")
  .option("--bridge-id <id>", "Stable bridge identity", `bridge_${process.pid}`)
  .option("--once", "Process at most one queued feedback batch and exit")
  .action((options) => {
    const intervalMs = parseInt(options.interval, 10);
    if (!Number.isInteger(intervalMs) || intervalMs < 50) {
      throw new CommanderError(2, "wc-view.invalidInterval", "wc-view bridge requires --interval of at least 50 ms");
    }
    const bridgeOptions = {
      command: options.command,
      bridgeId: options.bridgeId,
      intervalMs
    };
    if (options.once) {
      const result = runBridgeOnce(bridgeOptions);
      process.stdout.write(`${JSON.stringify({ processed: Boolean(result), batch: result || null })}\n`);
      return;
    }
    startBridge(bridgeOptions);
    process.stderr.write(`wc-view bridge: Listening as ${options.bridgeId}.\n`);
  });

program
  .command("gc")
  .description("Garbage-collect feedback queue items per retention lifecycle")
  .option("-a, --all", "Purge all resolved feedback items regardless of age")
  .option("-d, --days <number>", "Retention threshold in days", "30")
  .action((options) => {
    const purged = gcFeedback({ all: options.all, days: parseInt(options.days, 10) });
    process.stderr.write(`wc-view gc: Garbage collection purged ${purged} resolved item(s).\n`);
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof CommanderError) {
    if (["commander.unknownCommand", "commander.unknownOption", "commander.missingArgument", "commander.requiredOption"].includes(error.code)) {
      process.stderr.write(`wc-view error: ${error.message.replace(/^error:\s*/i, "")}\n`);
      process.stderr.write("wc-view help: run 'wc-view --help' for valid commands and options\n");
      process.exit(2);
    }
    if (error.code === "commander.helpDisplayed" || error.code === "commander.version") process.exit(0);
    process.stderr.write(`wc-view error: ${error.message.replace(/^error:\s*/i, "")}\n`);
    process.exit(error.exitCode || 1);
  }
  throw error;
}
