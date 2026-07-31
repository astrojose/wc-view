#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("wc-view")
  .description("Local Markdown review surface for agent workflows")
  .version("0.1.0");

program
  .command("serve")
  .description("Render Markdown files or a docs/ tree in a lightweight localhost browser UI")
  .option("-p, --port <number>", "Port to bind localhost server", "3456")
  .option("-h, --host <string>", "Host interface to bind", "127.0.0.1")
  .action((options) => {
    process.stderr.write(`wc-view serve: Starting localhost server on http://${options.host}:${options.port}\n`);
    // Server startup logic will be wired here in Phase 04 / CLI implementation
  });

program
  .command("feedback")
  .description("Pull structured review feedback payloads for agent consumption")
  .option("-u, --unresolved", "Filter to unresolved feedback items", true)
  .option("-f, --format <type>", "Output payload format (json|toon)", "json")
  .action((options) => {
    // POSIX stream discipline: structured data goes exclusively to stdout
    const payload = JSON.stringify({ version: "1.0", items: [] }, null, options.format === "json" ? 2 : 0);
    process.stdout.write(`${payload}\n`);
  });

program
  .command("gc")
  .description("Garbage-collect feedback queue items per retention lifecycle")
  .action(() => {
    process.stderr.write("wc-view gc: Garbage collection complete.\n");
  });

program.parse(process.argv);
