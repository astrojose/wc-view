import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readQueue, writeFeedbackItem, FeedbackItem } from "../core/queue.js";

export interface ServerOptions {
  port: number;
  host: string;
  targetPath?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getClientBundlePath(): string | null {
  const candidates = [
    path.join(__dirname, "..", "client", "main.js"),
    path.join(__dirname, "client", "main.js"),
    path.join(process.cwd(), "dist", "client", "main.js")
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Creates native HTTP server for wc-view localhost review surface.
 */
export function createServer(options: ServerOptions): http.Server {
  const targetPath = options.targetPath ? path.resolve(options.targetPath) : process.cwd();

  const server = http.createServer((req, res) => {
    // Loopback security check
    const remoteAddress = req.socket.remoteAddress;
    if (remoteAddress !== "127.0.0.1" && remoteAddress !== "::1" && remoteAddress !== "::ffff:127.0.0.1") {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden: wc-view loopback access only");
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    const pathname = url.pathname;

    // REST API — GET /api/document
    if (req.method === "GET" && pathname === "/api/document") {
      let content = "# Welcome to wc-view\n\nNo document loaded.";
      let docPath = targetPath;
      let files: string[] = [];

      if (fs.existsSync(targetPath)) {
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
          files = fs.readdirSync(targetPath).filter((f) => f.endsWith(".md"));
          const firstMd = files[0];
          if (firstMd) {
            docPath = path.join(targetPath, firstMd);
            content = fs.readFileSync(docPath, "utf-8");
          }
        } else {
          content = fs.readFileSync(targetPath, "utf-8");
          docPath = targetPath;
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ path: docPath, content, files }));
      return;
    }

    // REST API — GET /api/feedback
    if (req.method === "GET" && pathname === "/api/feedback") {
      const items = readQueue();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(items));
      return;
    }

    // REST API — POST /api/feedback
    if (req.method === "POST" && pathname === "/api/feedback") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body) as FeedbackItem;
          if (!parsed.id) parsed.id = `fb_${Date.now()}`;
          if (!parsed.filePath) parsed.filePath = targetPath;
          const saved = writeFeedbackItem(parsed);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(saved));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload", details: err.message }));
        }
      });
      return;
    }

    // Serve bundled client JS
    if (pathname === "/main.js") {
      const bundlePath = getClientBundlePath();
      if (bundlePath) {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(fs.readFileSync(bundlePath));
        return;
      }
    }

    // Serve HTML entry point
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(getAppHtml());
  });

  return server;
}

function getAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>wc-view — Local Markdown Review Surface</title>
  <style>
    :root {
      --bg-base: #121212;
      --surface-card: #1C1C1C;
      --surface-raised: #242424;
      --border-subtle: #2C2C2C;
      --fg-primary: #EDEBE4;
      --fg-secondary: #D1CFC0;
      --fg-muted: #8E8A83;
      --ring-accent: #D1CFC0;
      --accent-action: #F26A4B;
      --accent-action-fg: #121212;
      --annotation-bar: #D1CFC0;
      --annotation-tint: rgba(209,207,192,0.06);
    }
    [data-theme="light"] {
      --bg-base: #FCFCFC;
      --surface-card: #FFFFFF;
      --surface-raised: #FFFFFF;
      --border-subtle: #E4E4E7;
      --fg-primary: #18181B;
      --fg-secondary: #3F3F46;
      --fg-muted: #71717A;
      --ring-accent: #18181B;
      --accent-action: #18181B;
      --accent-action-fg: #FCFCFC;
      --annotation-bar: #18181B;
      --annotation-tint: rgba(24,24,27,0.04);
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg-base);
      color: var(--fg-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    #doc-canvas {
      width: min(72ch, 100% - 2rem);
      margin: 2rem auto 6rem auto;
      line-height: 1.6;
    }
    #doc-canvas header h1 {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 0.75rem;
    }
    .doc-block {
      padding: 0.75rem;
      margin: 0.5rem 0;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s, border-left 0.15s;
    }
    .doc-block:hover {
      background: var(--surface-card);
    }
    .doc-block.active {
      outline: 2px solid var(--ring-accent);
      background: var(--surface-raised);
    }
    .doc-block.annotated {
      border-left: 3px solid var(--ring-accent);
      background: var(--annotation-tint);
    }
    .status-region {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      padding: 0.6rem 1.25rem;
      border-radius: 20px;
      font-size: 0.875rem;
      color: var(--fg-secondary);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 100;
    }
    h1, h2, h3, h4, h5, h6 {
      color: var(--fg-primary);
      margin-top: 1.5rem;
    }
    code, pre {
      font-family: "JetBrains Mono", Menlo, Consolas, monospace;
      background: var(--surface-card);
      border-radius: 4px;
    }
    pre {
      padding: 1rem;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div id="doc-canvas" role="main"></div>
  <div class="status-region" role="status" aria-live="polite">wc-view local server active.</div>
  <script type="module" src="/main.js"></script>
</body>
</html>`;
}
