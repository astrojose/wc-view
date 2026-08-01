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

function getClientStyleBundlePath(): string | null {
  const candidates = [
    path.join(__dirname, "..", "client", "main.css"),
    path.join(__dirname, "client", "main.css"),
    path.join(process.cwd(), "dist", "client", "main.css")
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
  const eventClients = new Set<http.ServerResponse>();

  function broadcastFeedbackItem(item: FeedbackItem): void {
    const payload = `data: ${JSON.stringify(item)}\n\n`;

    for (const client of eventClients) {
      if (client.destroyed || client.writableEnded) {
        eventClients.delete(client);
        continue;
      }

      client.write(payload, (err) => {
        if (err) {
          eventClients.delete(client);
        }
      });
    }
  }

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

    // SSE API — GET /api/events
    if (req.method === "GET" && pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      });
      res.write(": connected\n\n");
      eventClients.add(res);

      req.on("close", () => {
        eventClients.delete(res);
      });
      return;
    }

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

          process.stderr.write(`wc-view feedback: New feedback received for ${parsed.filePath}\n`);
          process.stderr.write("wc-view feedback: Run 'wc-view feedback' to review it.\n");
          broadcastFeedbackItem(saved);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(saved));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload", details: err.message }));
        }
      });
      return;
    }

    // Serve bundled client JS/CSS and dynamic chunks
    if (pathname.match(/\.(js|css|map)$/)) {
      const filename = path.basename(pathname);
      const candidates = [
        path.join(__dirname, "..", "client", filename),
        path.join(__dirname, "client", filename),
        path.join(process.cwd(), "dist", "client", filename),
        path.join(process.cwd(), "dist", filename)
      ];

      let foundPath: string | null = null;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          foundPath = candidate;
          break;
        }
      }

      if (foundPath) {
        const ext = path.extname(foundPath);
        let contentType = "text/plain";
        if (ext === ".js") contentType = "text/javascript";
        else if (ext === ".css") contentType = "text/css";
        else if (ext === ".map") contentType = "application/json";

        res.writeHead(200, { "Content-Type": contentType });
        res.end(fs.readFileSync(foundPath));
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
  <link rel="stylesheet" href="/main.css">
</head>
<body>
  <div id="doc-canvas" class="doc-canvas" role="main" aria-label="Document Canvas"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>`;
}
