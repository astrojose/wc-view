#!/usr/bin/env node
import { Command } from "commander";
import { createServer } from "../server/index.js";
import { getUnresolvedItems, gcFeedback } from "../core/queue.js";

const program = new Command();

program
  .name("wc-view")
  .description("Local Markdown review surface for agent workflows")
  .version("0.1.0");

program
  .command("serve [path]")
  .description("Render Markdown files or a docs/ tree in a lightweight localhost browser UI")
  .option("-p, --port <number>", "Port to bind localhost server", "3456")
  .option("-h, --host <string>", "Host interface to bind", "127.0.0.1")
  .action((targetPath, options) => {
    const port = parseInt(options.port, 10);
    const host = options.host;
    const server = createServer({ port, host, targetPath });

    server.listen(port, host, () => {
      process.stderr.write(`wc-view serve: Localhost server active on http://${host}:${port}\n`);
    });
  });

program
  .command("feedback")
  .description("Pull structured review feedback payloads for agent consumption")
  .option("-u, --unresolved", "Filter to unresolved feedback items", true)
  .option("-f, --format <type>", "Output payload format (json|toon)", "json")
  .action((options) => {
    const items = getUnresolvedItems();
    const payload = {
      version: "1.0",
      total: items.length,
      items
    };

    const formatted = options.format === "json"
      ? JSON.stringify(payload, null, 2)
      : JSON.stringify(payload);

    // POSIX stream discipline: structured data output to stdout only
    process.stdout.write(`${formatted}\n`);
  });

program
  .command("gc")
  .description("Garbage-collect feedback queue items per retention lifecycle")
  .option("-a, --all", "Purge all resolved feedback items regardless of age")
  .option("-d, --days <number>", "Retention threshold in days", "30")
  .action((options) => {
    const days = parseInt(options.days, 10);
    const purged = gcFeedback({ all: options.all, days });
    // POSIX stream discipline: diagnostics/logs to stderr only
    process.stderr.write(`wc-view gc: Garbage collection purged ${purged} resolved item(s).\n`);
  });

program.parse(process.argv);
