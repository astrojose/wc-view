import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  approveBatch,
  classifyArtifact,
  createFeedbackBatch,
  FeedbackBatch,
  FeedbackItem,
  readBatches,
  readQueue,
  writeFeedbackItem
} from "../core/queue.js";

export interface ServerOptions {
  port: number;
  host: string;
  targetPath?: string;
  queuePath?: string;
}

export type DocumentFormat = "markdown" | "html";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAX_REQUEST_BYTES = 100 * 1024;

function readJsonBody(req: http.IncomingMessage, res: http.ServerResponse, onBody: (body: string) => void): void {
  let body = "";
  let tooLarge = false;
  req.setEncoding("utf-8");
  req.on("data", (chunk: string) => {
    if (tooLarge) return;
    body += chunk;
    if (Buffer.byteLength(body, "utf-8") > MAX_REQUEST_BYTES) {
      tooLarge = true;
      res.writeHead(413, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Feedback payload exceeds 100 KiB." }));
    }
  });
  req.on("end", () => {
    if (!tooLarge) onBody(body);
  });
}

function getClientBundlePath(): string | null {
  const candidates = [
    path.join(__dirname, "..", "client", "main.js"),
    path.join(__dirname, "client", "main.js"),
    path.join(process.cwd(), "dist", "client", "main.js")
  ];
  return candidates.find(fs.existsSync) || null;
}

function getClientStyleBundlePath(): string | null {
  const candidates = [
    path.join(__dirname, "..", "client", "main.css"),
    path.join(__dirname, "client", "main.css"),
    path.join(process.cwd(), "dist", "client", "main.css")
  ];
  return candidates.find(fs.existsSync) || null;
}

function isMarkdownFile(filePath: string): boolean {
  return /\.md$/i.test(filePath);
}

function isHtmlFile(filePath: string): boolean {
  return /\.html?$/i.test(filePath);
}

function getDocumentFormat(filePath: string): DocumentFormat {
  return isHtmlFile(filePath) ? "html" : "markdown";
}

function getDirectoryDocument(files: string[]): string | undefined {
  const viewableFiles = files.filter((file) => isMarkdownFile(file) || isHtmlFile(file));
  return (
    viewableFiles.find((file) => /^\.wc-view-scratch[^/]*\.html?$/i.test(path.basename(file))) ||
    viewableFiles.find((file) => /^\.wc-view-scratch[^/]*\.md$/i.test(path.basename(file))) ||
    viewableFiles.find(isHtmlFile) ||
    viewableFiles.find(isMarkdownFile)
  );
}

export function getStaticAssetCandidates(filename: string, baseDir: string = __dirname): string[] {
  return [
    path.join(baseDir, "..", "client", filename),
    path.join(baseDir, "client", filename),
    path.join(baseDir, filename),
    path.join(process.cwd(), "dist", "client", filename),
    path.join(process.cwd(), "dist", filename)
  ];
}

export function createServer(options: ServerOptions): http.Server {
  const targetPath = options.targetPath ? path.resolve(options.targetPath) : process.cwd();
  const workspacePath = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath);
  const eventClients = new Set<http.ServerResponse>();
  const servedDocumentPath = (): string => {
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) return targetPath;
    const firstDocument = getDirectoryDocument(fs.readdirSync(targetPath));
    return firstDocument ? path.join(targetPath, firstDocument) : targetPath;
  };

  const batchesForTarget = (): FeedbackBatch[] => readBatches(options.queuePath).filter((batch) => batch.filePath === servedDocumentPath());
  const writeEvent = (response: http.ServerResponse, event: "snapshot" | "batch", payload: unknown): void => {
    response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };
  const broadcast = (event: "snapshot" | "batch", payload: unknown): void => {
    for (const client of eventClients) {
      if (client.destroyed || client.writableEnded) {
        eventClients.delete(client);
        continue;
      }
      writeEvent(client, event, payload);
    }
  };

  let lastBatchSnapshot = JSON.stringify(batchesForTarget());
  const batchWatcher = setInterval(() => {
    const snapshot = JSON.stringify(batchesForTarget());
    if (snapshot === lastBatchSnapshot) return;
    lastBatchSnapshot = snapshot;
    broadcast("snapshot", JSON.parse(snapshot));
  }, 300);

  const server = http.createServer((req, res) => {
    const remoteAddress = req.socket.remoteAddress;
    if (remoteAddress !== "127.0.0.1" && remoteAddress !== "::1" && remoteAddress !== "::ffff:127.0.0.1") {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden: wc-view loopback access only");
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      });
      writeEvent(res, "snapshot", batchesForTarget());
      eventClients.add(res);
      req.on("close", () => eventClients.delete(res));
      return;
    }

    if (req.method === "GET" && pathname === "/api/document") {
      let content = "# Welcome to wc-view\n\nNo document loaded.";
      let docPath = targetPath;
      let files: string[] = [];
      if (fs.existsSync(targetPath)) {
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
          files = fs.readdirSync(targetPath).filter((file) => isMarkdownFile(file) || isHtmlFile(file));
          const first = getDirectoryDocument(files);
          if (first) {
            docPath = path.join(targetPath, first);
            content = fs.readFileSync(docPath, "utf-8");
          }
        } else {
          content = fs.readFileSync(targetPath, "utf-8");
        }
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ path: docPath, content, files, format: getDocumentFormat(docPath), artifactClass: classifyArtifact(docPath, workspacePath) }));
      return;
    }

    if (req.method === "GET" && pathname === "/api/feedback") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(readQueue(options.queuePath)));
      return;
    }

    if (req.method === "POST" && pathname === "/api/feedback") {
      readJsonBody(req, res, (body) => {
        try {
          const parsed = JSON.parse(body) as Partial<FeedbackItem>;
          if (!parsed || typeof parsed !== "object") throw new Error("Feedback payload must be an object.");
          if (parsed.id !== undefined && typeof parsed.id !== "string") throw new Error("Feedback id must be a string.");
          if (parsed.filePath !== undefined && typeof parsed.filePath !== "string") throw new Error("File path must be a string.");
          if (typeof parsed.comment !== "string" || !parsed.anchor || typeof parsed.anchor !== "object") {
            throw new Error("Feedback requires an anchor and comment.");
          }
          const saved = writeFeedbackItem({
            ...parsed,
            id: parsed.id || `fb_${Date.now()}`,
            filePath: parsed.filePath || targetPath,
            status: parsed.status || "unresolved",
            anchor: parsed.anchor,
            comment: parsed.comment,
            createdAt: parsed.createdAt || new Date().toISOString(),
            updatedAt: parsed.updatedAt || new Date().toISOString()
          }, options.queuePath);
          process.stderr.write(`wc-view feedback: Legacy note received for ${saved.filePath}\n`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(saved));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload", details: error instanceof Error ? error.message : "Unknown error" }));
        }
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/batches") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(batchesForTarget()));
      return;
    }

    if (req.method === "POST" && pathname === "/api/batches") {
      readJsonBody(req, res, (body) => {
        try {
          const parsed = JSON.parse(body) as Partial<Pick<FeedbackBatch, "id" | "filePath" | "prompt" | "notes">>;
          if (parsed.id !== undefined && typeof parsed.id !== "string") throw new Error("Batch id must be a string.");
          if (parsed.filePath !== undefined && typeof parsed.filePath !== "string") throw new Error("File path must be a string.");
          if (parsed.prompt !== undefined && typeof parsed.prompt !== "string") throw new Error("Prompt must be a string.");
          if (parsed.notes !== undefined && !Array.isArray(parsed.notes)) throw new Error("Notes must be an array.");
          const batch = createFeedbackBatch({
            id: parsed.id,
            filePath: parsed.filePath || servedDocumentPath(),
            prompt: parsed.prompt || "",
            notes: parsed.notes || []
          }, workspacePath, options.queuePath);
          lastBatchSnapshot = JSON.stringify(batchesForTarget());
          if (batch.filePath === servedDocumentPath()) broadcast("batch", batch);
          process.stderr.write(`wc-view feedback: Batch ${batch.id} queued for ${batch.filePath}\n`);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(batch));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid feedback batch", details: error instanceof Error ? error.message : "Unknown error" }));
        }
      });
      return;
    }

    const acceptMatch = pathname.match(/^\/api\/batches\/([^/]+)\/accept$/);
    if (req.method === "POST" && acceptMatch) {
      try {
        const batch = approveBatch(decodeURIComponent(acceptMatch[1]), options.queuePath);
        if (!batch) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Feedback batch not found." }));
          return;
        }
        lastBatchSnapshot = JSON.stringify(batchesForTarget());
        if (batch.filePath === servedDocumentPath()) broadcast("batch", batch);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(batch));
      } catch (error) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Batch cannot be accepted." }));
      }
      return;
    }

    if (pathname.match(/\.(js|css|map)$/)) {
      const filename = path.basename(pathname);
      const candidates = getStaticAssetCandidates(filename);
      const foundPath = candidates.find(fs.existsSync);
      if (foundPath) {
        const ext = path.extname(foundPath);
        res.writeHead(200, {
          "Content-Type": ext === ".js" ? "text/javascript" : ext === ".css" ? "text/css" : "application/json",
          "Cache-Control": "no-store"
        });
        res.end(fs.readFileSync(foundPath));
        return;
      }
      res.writeHead(404, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
      res.end("Static asset not found");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(getAppHtml());
  });

  server.on("close", () => clearInterval(batchWatcher));
  return server;
}

function getAppHtml(): string {
  const client = getClientBundlePath();
  const styles = getClientStyleBundlePath();
  if (!client || !styles) {
    // The normal static asset lookup below remains the delivery path; this guards development builds.
  }
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>wc-view — Local Review Surface</title>
  <link rel="stylesheet" href="/main.css">
</head>
<body>
  <div id="doc-canvas" class="doc-canvas" role="main" aria-label="Document Canvas"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>`;
}
