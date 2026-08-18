#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "../server/index.js";
import { getUnresolvedItems, getUnresolvedBatches, getWorkspaceStore, getLegacyQueuePath, listWorkspaceStores, gcFeedback, resolveFeedbackItem, addAgentReply, FeedbackItem, FeedbackBatch } from "../core/queue.js";
import { runBridgeOnce, startBridge } from "../core/bridge.js";
import { exportMarkdownFile } from "../core/export.js";
import { openDefaultBrowser } from "./open-browser.js";

const program = new Command();

function getPackageVersion(): string {
  const entryPath = fileURLToPath(import.meta.url);
  const entryDirs = new Set([path.dirname(entryPath)]);
  try {
    entryDirs.add(path.dirname(fs.realpathSync(entryPath)));
  } catch {
    // Symlink resolution is best-effort; direct execution still works without it.
  }

  for (const cliDir of entryDirs) {
    const packageCandidates = [
      path.resolve(cliDir, "..", "..", "package.json"),
      path.resolve(cliDir, "..", "@astrojose", "wc-view", "package.json")
    ];
    for (const packagePath of packageCandidates) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8")) as { name?: string; version?: string };
        if (packageJson.name === "@astrojose/wc-view" && packageJson.version) {
          return packageJson.version;
        }
      } catch {
        // Keep looking through the install layouts npm may use.
      }
    }
  }
  return "0.6.0";
}

program
  .name("wc-view")
  .description("Local Markdown and HTML review surface for agent workflows")
  .version(getPackageVersion());


program.exitOverride();
program.configureOutput({ writeErr: () => {} });
program.addHelpText("beforeAll", "bin: ~/.local/bin/wc-view\ndescription: Local Markdown and HTML review surface for agent workflows\n");

program
  .command("serve [path]")
  .description("Render Markdown, HTML artifacts, or a docs/ tree in a lightweight localhost browser UI")
  .option("-p, --port <number>", "Port to bind localhost server", "3456")
  .option("-H, --host <string>", "Host interface to bind", "127.0.0.1")
  .option("--open", "Open the artifact in the system default browser")
  .option("--agent-command <command>", "Start a local agent bridge with this adapter command")
  .action(async (targetPath, options) => {
    const port = parseInt(options.port, 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new CommanderError(2, "wc-view.invalidPort", "wc-view serve requires --port between 1 and 65535");
    }
    const host = options.host;
    if (host !== "127.0.0.1" && host !== "localhost") {
      throw new CommanderError(2, "wc-view.invalidHost", "wc-view serve only supports 127.0.0.1 loopback binding");
    }
    const server = createServer({ port, host: "127.0.0.1", targetPath, agentBridgeActive: Boolean(options.agentCommand) });
    const resolvedTarget = path.resolve(targetPath || process.cwd());
    const workspacePath = fs.existsSync(resolvedTarget) && fs.statSync(resolvedTarget).isDirectory() ? resolvedTarget : path.dirname(resolvedTarget);
    let stopBridge: (() => Promise<void>) | undefined;
    if (options.agentCommand) {
      stopBridge = startBridge({
        command: options.agentCommand,
        bridgeId: `serve_${process.pid}`,
        workspacePath
      });
    } else {
      const store = getWorkspaceStore(workspacePath);
      const pendingCount = getUnresolvedBatches({}, store.queuePath).filter((batch) => batch.status === "queued").length;
      if (pendingCount > 0) {
        process.stderr.write(`wc-view serve: ${pendingCount} feedback batch(es) already queued with no agent bridge attached. Pass --agent-command <cmd>, or run 'wc-view bridge --workspace ${workspacePath} --command <cmd>', so they get processed.\n`);
      }
    }
    const shutdown = async () => {
      await stopBridge?.();
      server.close(() => process.exit(0));
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    let listening = false;
    await new Promise<void>((resolve, reject) => {
      server.on("error", (error: NodeJS.ErrnoException) => {
        if (!listening && error.code === "EADDRINUSE") {
          reject(new CommanderError(1, "wc-view.portInUse", `wc-view serve: port ${port} is already in use. Pass --port <number> for a different port, or stop the process bound to it.`));
          return;
        }
        if (!listening) { reject(error); return; }
        process.stderr.write(`wc-view serve: server error - ${error.message}\n`);
      });
      server.listen(port, "127.0.0.1", () => {
        listening = true;
        const url = `http://127.0.0.1:${port}`;
        process.stderr.write(`wc-view serve: Localhost server active on ${url}\n`);
        if (options.open) openDefaultBrowser(url);
        if (options.agentCommand) process.stderr.write("wc-view serve: Local agent bridge active.\n");
        resolve();
      });
    });
  });

program
  .command("export <path>")
  .description("Export a Markdown review document to a standalone offline HTML file")
  .option("-o, --out <path>", "Destination HTML output file path")
  .action((targetPath, options) => {
    try {
      const outPath = exportMarkdownFile(targetPath, options.out);
      process.stderr.write(`wc-view export: Exported standalone HTML to ${outPath}\n`);
      process.stdout.write(`${JSON.stringify({ exported: true, source: targetPath, destination: outPath })}\n`);
    } catch (error) {
      process.stderr.write(`wc-view error: ${error instanceof Error ? error.message : "Export failed"}\n`);
      process.exit(1);
    }
  });

const feedbackCmd = program
  .command("feedback")
  .description("Pull structured review feedback payloads for agent consumption")
  .option("-u, --unresolved", "Filter to unresolved feedback items", true)
  .option("-f, --format <type>", "Output payload format (json|toon|markdown)", "json")
  .option("--workspace <path>", "Workspace scope", process.cwd())
  .option("--target <path>", "Filter by canonical target path")
  .option("--session <id>", "Filter by originating serve session")
  .option("--legacy", "Include unresolved legacy individual notes")
  .option("--all-workspaces", "Explicitly list records from every known workspace")
  .action((options) => {
    const stores = options.allWorkspaces ? listWorkspaceStores() : [getWorkspaceStore(options.workspace)];
    const batches = stores.flatMap((store) => getUnresolvedBatches({ target: options.target, sessionId: options.session }, store.queuePath));
    const legacyItems = options.legacy ? getUnresolvedItems(options.target, getLegacyQueuePath()) : [];
    const items: Array<FeedbackBatch | FeedbackItem> = [...batches, ...legacyItems];
    if (options.format === "json") {
      process.stdout.write(`${JSON.stringify({ version: "1.0", total: items.length, items }, null, 2)}\n`);
      return;
    }
    if (options.format === "markdown") {
      if (items.length === 0) {
        process.stdout.write("## Review Feedback\n\nNo unresolved feedback items.\n");
        return;
      }
      let md = `## Review Feedback (${items.length} unresolved)\n\n`;
      items.forEach((item, idx: number) => {
        if ("recordType" in item) {
          md += `### ${idx + 1}. \`${item.filePath}\` (${item.id})\n- **Status**: ${item.status}\n- **Prompt**: ${item.prompt || "(notes only)"}\n- **Notes**: ${item.notes.length}\n\n`;
        } else {
          const exact = item.anchor?.primary?.exact ? `> "${item.anchor.primary.exact}"\n\n` : "";
          md += `### ${idx + 1}. \`${item.filePath}\` (${item.id})\n${exact}- **Comment**: ${item.comment}\n\n`;
        }
      });
      process.stdout.write(md);
      return;
    }
    if (items.length === 0) {
      process.stdout.write("feedback: 0 unresolved items\n");
      return;
    }
    process.stdout.write(`count: ${items.length} unresolved\nfeedback[${items.length}]{id,status,filePath}:\n`);
    items.forEach((item) => process.stdout.write(`  "${item.id}","${item.status}","${item.filePath}"\n`));
  });

feedbackCmd
  .command("resolve <id>")
  .description("Mark a feedback item, batch, or note as resolved")
  .action((id) => {
    const result = resolveFeedbackItem(id);
    if (!result) {
      process.stderr.write(`wc-view error: Feedback item "${id}" not found.\n`);
      process.exit(1);
    }
    process.stderr.write(`wc-view feedback: Resolved ${result.type} "${result.id}".\n`);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  });

feedbackCmd
  .command("reply <batchId>")
  .description("Post an agent reply message back to a feedback batch")
  .requiredOption("-m, --message <text>", "Reply message text from the agent")
  .action((batchId, options) => {
    try {
      const updated = addAgentReply(batchId, options.message, "agent");
      if (!updated) {
        process.stderr.write(`wc-view error: Feedback batch "${batchId}" not found.\n`);
        process.exit(1);
      }
      process.stderr.write(`wc-view feedback: Reply recorded for batch "${batchId}".\n`);
      process.stdout.write(`${JSON.stringify({ replied: true, batchId, repliesCount: updated.replies?.length || 0 })}\n`);
    } catch (error) {
      process.stderr.write(`wc-view error: ${error instanceof Error ? error.message : "Reply failed"}\n`);
      process.exit(1);
    }
  });



program
  .command("bridge")
  .description("Claim feedback batches and dispatch them to a local agent adapter")
  .requiredOption("--command <command>", "Adapter command; receives one policy-specific batch envelope on stdin")
  .requiredOption("--workspace <path>", "Workspace whose queue may be claimed")
  .option("--interval <ms>", "Queue recovery polling interval", "500")
  .option("--bridge-id <id>", "Stable bridge identity", `bridge_${process.pid}`)
  .option("--once", "Process at most one queued feedback batch and exit")
  .action(async (options) => {
    const intervalMs = parseInt(options.interval, 10);
    if (!Number.isInteger(intervalMs) || intervalMs < 50) {
      throw new CommanderError(2, "wc-view.invalidInterval", "wc-view bridge requires --interval of at least 50 ms");
    }
    const bridgeOptions = {
      command: options.command,
      bridgeId: options.bridgeId,
      workspacePath: options.workspace,
      intervalMs
    };
    if (options.once) {
      const result = await runBridgeOnce(bridgeOptions);
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
