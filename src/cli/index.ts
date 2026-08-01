#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import { createServer } from "../server/index.js";
import { getUnresolvedItems, gcFeedback, FeedbackItem } from "../core/queue.js";

const program = new Command();

program
  .name("wc-view")
  .description("Local Markdown review surface for agent workflows")
  .version("0.2.1");

// AXI Principle 6: structured errors & exit codes
program.exitOverride();
program.configureOutput({
  writeErr: () => {} // Suppress default error printing; we handle it in catch block
});

// AXI Principle 10: Consistent way to get help
program.addHelpText('beforeAll', `bin: ~/.local/bin/wc-view\ndescription: Local Markdown review surface for agent workflows\n`);

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

    if (options.format === "json") {
      const payload = {
        version: "1.0",
        total: items.length,
        items
      };
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }

    // TOON format
    if (items.length === 0) {
      process.stdout.write(`feedback: 0 unresolved items\n`);
    } else {
      process.stdout.write(`count: ${items.length} unresolved\n`);
      process.stdout.write(`feedback[${items.length}]{id,status,filePath}:\n`);
      items.forEach((item: FeedbackItem) => {
        process.stdout.write(`  "${item.id}","${item.status}","${item.filePath}"\n`);
      });
      process.stdout.write(`help[1]: Run 'wc-view serve <path>' to view the related document in the visualizer\n`);
      process.stdout.write(`help[2]: Run 'wc-view gc' to garbage collect resolved items\n`);
    }
  });

program
  .command("gc")
  .description("Garbage-collect feedback queue items per retention lifecycle")
  .option("-a, --all", "Purge all resolved feedback items regardless of age")
  .option("-d, --days <number>", "Retention threshold in days", "30")
  .action((options) => {
    const days = parseInt(options.days, 10);
    const purged = gcFeedback({ all: options.all, days });
    process.stderr.write(`wc-view gc: Garbage collection purged ${purged} resolved item(s).\n`);
  });

try {
  program.parse(process.argv);
} catch (err: any) {
  if (err instanceof CommanderError) {
    if (err.code === 'commander.unknownCommand' || err.code === 'commander.unknownOption' || err.code === 'commander.missingArgument') {
      const cleanMessage = err.message.replace(/^error:\s*/i, '');
      process.stderr.write(`wc-view error: ${cleanMessage}\n`);
      process.stderr.write(`wc-view help: run 'wc-view --help' for valid commands and options\n`);
      process.exit(2); // AXI Principle 6
    } else if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
      process.exit(0);
    }
    process.exit(err.exitCode || 1);
  } else {
    throw err;
  }
}
