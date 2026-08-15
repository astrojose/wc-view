import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addAgentReply,
  approveBatch,
  classifyArtifact,
  createFeedbackBatch,
  FeedbackBatch,
  FeedbackItem,
  readBatches,
  readQueue,
  getLegacyQueuePath,
  getWorkspaceStore,
  initializeWorkspaceStore,
  writeFeedbackItem
} from "../core/queue.js";


export interface ServerOptions {
  port: number;
  host: string;
  targetPath?: string;
  queuePath?: string;
  agentBridgeActive?: boolean;
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

export function listMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    return (dir.endsWith(".md") || isHtmlFile(dir)) ? [path.relative(baseDir, dir).split(path.sep).join("/")] : [];
  }

  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && !entry.name.startsWith(".wc-view-scratch")) continue;
    if (["node_modules", "dist", ".git", ".gemini", ".agents"].includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && (entry.name.endsWith(".md") || isHtmlFile(entry.name))) {
      results.push(path.relative(baseDir, fullPath).split(path.sep).join("/"));
    }
  }
  return results.sort();
}

export function createServer(options: ServerOptions): http.Server {
  const requestedTargetPath = options.targetPath ? path.resolve(options.targetPath) : process.cwd();
  const targetPath = fs.existsSync(requestedTargetPath) ? fs.realpathSync(requestedTargetPath) : requestedTargetPath;
  const workspacePath = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory() ? targetPath : path.dirname(targetPath);
  const workspaceStore = options.queuePath ? getWorkspaceStore(workspacePath) : initializeWorkspaceStore(workspacePath);
  const queuePath = options.queuePath ?? workspaceStore.queuePath;
  const agentBridgeActive = Boolean(options.agentBridgeActive);
  const sessionId = `serve_${crypto.randomUUID()}`;
  const eventClients = new Map<http.ServerResponse, string>();

  const defaultDocumentPath = (): string | undefined => {
    if (!fs.existsSync(targetPath)) return undefined;
    if (!fs.statSync(targetPath).isDirectory()) return fs.statSync(targetPath).isFile() && (isMarkdownFile(targetPath) || isHtmlFile(targetPath)) ? targetPath : undefined;
    const first = getDirectoryDocument(listMarkdownFiles(targetPath));
    return first ? fs.realpathSync(path.join(targetPath, first)) : undefined;
  };
  const validatedDocumentPath = (url: URL): string | undefined => {
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) return defaultDocumentPath();
    const requested = url.searchParams.get("file");
    if (!requested) return defaultDocumentPath();
    const candidate = path.resolve(targetPath, requested);
    const relative = path.relative(targetPath, candidate);
    if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return undefined;
    const canonicalCandidate = fs.realpathSync(candidate);
    const canonicalRelative = path.relative(targetPath, canonicalCandidate);
    if (canonicalRelative === ".." || canonicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(canonicalRelative) || (!isMarkdownFile(canonicalCandidate) && !isHtmlFile(canonicalCandidate))) return undefined;
    return canonicalCandidate;
  };
  const requestDocumentPath = (url: URL, response: http.ServerResponse): string | undefined => {
    const documentPath = validatedDocumentPath(url);
    if (documentPath) return documentPath;
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid or unsupported document target." }));
    return undefined;
  };
  const batchesForTarget = (documentPath: string): FeedbackBatch[] => readBatches(queuePath).filter((batch) => batch.filePath === documentPath);
  const writeEvent = (response: http.ServerResponse, event: "snapshot" | "batch" | "document_change", payload: unknown): void => {
    response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };
  const broadcastBatch = (batch: FeedbackBatch): void => {
    for (const [client, documentPath] of eventClients) {
      if (client.destroyed || client.writableEnded) eventClients.delete(client);
      else if (batch.filePath === documentPath) writeEvent(client, "batch", batch);
    }
  };
  const broadcastDocument = (documentPath: string, payload: unknown): void => {
    for (const [client, target] of eventClients) {
      if (client.destroyed || client.writableEnded) eventClients.delete(client);
      else if (target === documentPath) writeEvent(client, "document_change", payload);
    }
  };
  const lastSnapshots = new Map<string, string>();
  const publishSnapshots = (): void => {
    const documents = new Set(eventClients.values());
    const changed = new Map<string, unknown>();
    for (const documentPath of documents) {
      const snapshot = JSON.stringify(batchesForTarget(documentPath));
      if (lastSnapshots.get(documentPath) === snapshot) continue;
      lastSnapshots.set(documentPath, snapshot);
      changed.set(documentPath, JSON.parse(snapshot));
    }
    for (const [client, documentPath] of eventClients) {
      if (client.destroyed || client.writableEnded) eventClients.delete(client);
      else if (changed.has(documentPath)) writeEvent(client, "snapshot", changed.get(documentPath));
    }
    for (const documentPath of lastSnapshots.keys()) if (!documents.has(documentPath)) lastSnapshots.delete(documentPath);
  };
  const batchWatcher = setInterval(publishSnapshots, 1_000);
  let queueWatcher: fs.FSWatcher | undefined;
  try {
    const queueDirectory = path.dirname(queuePath);
    const queueFilename = path.basename(queuePath);
    fs.mkdirSync(queueDirectory, { recursive: true });
    queueWatcher = fs.watch(queueDirectory, (_event, filename) => { if (!filename || filename === queueFilename) publishSnapshots(); });
  } catch {}

  // Live document watcher
  let docWatchDebounce: NodeJS.Timeout | undefined;
  let changedDocumentPath: string | undefined;
  let fileWatcher: fs.FSWatcher | undefined;
  try {
    if (fs.existsSync(targetPath)) {
      fileWatcher = fs.watch(targetPath, { recursive: true }, (_event, filename) => {
        const candidate = fs.statSync(targetPath).isDirectory() && filename ? path.resolve(targetPath, filename.toString()) : targetPath;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && (isMarkdownFile(candidate) || isHtmlFile(candidate))) changedDocumentPath = fs.realpathSync(candidate);
        clearTimeout(docWatchDebounce);
        docWatchDebounce = setTimeout(() => {
          const currentDoc = changedDocumentPath ?? defaultDocumentPath();
          changedDocumentPath = undefined;
          if (currentDoc && fs.existsSync(currentDoc) && !fs.statSync(currentDoc).isDirectory()) {
            try {
              const content = fs.readFileSync(currentDoc, "utf-8");
              const files = fs.statSync(targetPath).isDirectory() ? listMarkdownFiles(targetPath) : [path.basename(targetPath)];
              broadcastDocument(currentDoc, {
                path: currentDoc,
                content,
                files,
                artifactClass: classifyArtifact(currentDoc, workspacePath)
              });
            } catch {
              // File is being written atomically
            }
          }
        }, 150);
      });
    }
  } catch {
    // OS recursive watch fallback
  }

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
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      });
      writeEvent(res, "snapshot", batchesForTarget(documentPath));
      eventClients.set(res, documentPath);
      req.on("close", () => eventClients.delete(res));
      return;
    }

    if (req.method === "GET" && pathname === "/api/document") {
      let content = "# Welcome to wc-view\n\nNo document loaded.";
      const docPath = requestDocumentPath(url, res);
      if (!docPath) return;
      let files: string[] = [];

      if (fs.existsSync(targetPath)) {
        files = fs.statSync(targetPath).isDirectory() ? listMarkdownFiles(targetPath) : [path.basename(targetPath)];
        if (fs.existsSync(docPath) && fs.statSync(docPath).isFile()) content = fs.readFileSync(docPath, "utf-8");
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      const relativePath = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory() ? path.relative(targetPath, docPath).split(path.sep).join("/") : undefined;
      res.end(JSON.stringify({ path: docPath, relativePath, content, files, format: getDocumentFormat(docPath), artifactClass: classifyArtifact(docPath, workspacePath), sessionId, bridgeActive: agentBridgeActive }));
      return;
    }


    if (req.method === "GET" && pathname === "/api/feedback") {
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(readQueue(getLegacyQueuePath()).filter((item) => path.resolve(item.filePath) === documentPath)));
      return;
    }

    if (req.method === "POST" && pathname === "/api/feedback") {
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      readJsonBody(req, res, (body) => {
        try {
          const parsed = JSON.parse(body) as Partial<FeedbackItem>;
          if (!parsed || typeof parsed !== "object") throw new Error("Feedback payload must be an object.");
          if (parsed.id !== undefined && typeof parsed.id !== "string") throw new Error("Feedback id must be a string.");
          if (parsed.filePath !== undefined) throw new Error("filePath is server-derived and must not be supplied.");
          if (typeof parsed.comment !== "string" || !parsed.anchor || typeof parsed.anchor !== "object") {
            throw new Error("Feedback requires an anchor and comment.");
          }
          const saved = writeFeedbackItem({
            ...parsed,
            id: parsed.id || `fb_${Date.now()}`,
            filePath: documentPath,
            status: parsed.status || "unresolved",
            anchor: parsed.anchor,
            comment: parsed.comment,
            createdAt: parsed.createdAt || new Date().toISOString(),
            updatedAt: parsed.updatedAt || new Date().toISOString()
          }, getLegacyQueuePath());
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
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(batchesForTarget(documentPath)));
      return;
    }

    if (req.method === "POST" && pathname === "/api/batches") {
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      readJsonBody(req, res, (body) => {
        try {
          const parsed = JSON.parse(body) as Partial<Pick<FeedbackBatch, "id" | "filePath" | "prompt" | "notes">>;
          if (parsed.id !== undefined && typeof parsed.id !== "string") throw new Error("Batch id must be a string.");
          const forbidden = parsed as Record<string, unknown>;
          for (const field of ["filePath", "workspacePath", "workspaceId", "sessionId"]) if (field in forbidden) throw new Error(`${field} is server-derived and must not be supplied.`);
          if (parsed.prompt !== undefined && typeof parsed.prompt !== "string") throw new Error("Prompt must be a string.");
          if (parsed.notes !== undefined && !Array.isArray(parsed.notes)) throw new Error("Notes must be an array.");
          const batch = createFeedbackBatch({
            id: parsed.id,
            filePath: documentPath,
            sessionId,
            prompt: parsed.prompt || "",
            notes: parsed.notes || []
          }, workspacePath, queuePath);
          broadcastBatch(batch);
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
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      try {
        const batch = approveBatch(decodeURIComponent(acceptMatch[1]), queuePath, documentPath);
        if (!batch) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Feedback batch not found." }));
          return;
        }
        broadcastBatch(batch);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(batch));
      } catch (error) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Batch cannot be accepted." }));
      }
      return;
    }

    const replyMatch = pathname.match(/^\/api\/batches\/([^/]+)\/reply$/);
    if (req.method === "POST" && replyMatch) {
      const documentPath = requestDocumentPath(url, res);
      if (!documentPath) return;
      readJsonBody(req, res, (body) => {
        try {
          const parsed = JSON.parse(body) as { message: string; sender?: "agent" | "human" };
          if (!parsed || typeof parsed.message !== "string" || !parsed.message.trim()) {
            throw new Error("Reply requires a non-empty message string.");
          }
          const batchId = decodeURIComponent(replyMatch[1]);
          const batch = addAgentReply(batchId, parsed.message, parsed.sender || "agent", queuePath, documentPath);
          if (!batch) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Feedback batch not found." }));
            return;
          }
          broadcastBatch(batch);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(batch));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid reply payload" }));
        }
      });
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

  server.on("close", () => {
    clearInterval(batchWatcher);
    clearTimeout(docWatchDebounce);
    try { fileWatcher?.close(); } catch {}
    try { queueWatcher?.close(); } catch {}
  });
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
