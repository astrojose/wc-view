import { describe, it, expect, beforeEach, afterEach } from "vitest";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { AddressInfo } from "node:net";
import { createServer, getStaticAssetCandidates } from "../server/index.js";

describe("Server & CLI Integration", () => {
  let server: http.Server;
  let tmpDir: string;
  let testDocPath: string;
  let queuePath: string;
  let baseUrl: string;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wc-view-server-test-"));
    testDocPath = path.join(tmpDir, ".wc-view-scratch.md");
    queuePath = path.join(tmpDir, "queue.jsonl");
    fs.writeFileSync(testDocPath, "# Test Title\n\nTest paragraph content.", "utf-8");
    server = createServer({ port: 0, host: "127.0.0.1", targetPath: testDocPath, queuePath });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("serves document metadata including artifact policy and non-cacheable client assets", async () => {
    const response = await fetch(`${baseUrl}/api/document`);
    expect(await response.json()).toMatchObject({ path: fs.realpathSync(testDocPath), artifactClass: "scratch", format: "markdown" });
    const client = await fetch(`${baseUrl}/main.js`);
    expect(client.headers.get("cache-control")).toBe("no-store");
    await client.text();
  });

  it("reports whether an agent bridge is attached via document metadata", async () => {
    const noBridge = await fetch(`${baseUrl}/api/document`);
    expect(await noBridge.json()).toMatchObject({ bridgeActive: false });

    await new Promise<void>((resolve) => server.close(() => resolve()));
    server = createServer({ port: 0, host: "127.0.0.1", targetPath: testDocPath, queuePath, agentBridgeActive: true });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const withBridge = await fetch(`${baseUrl}/api/document`);
    expect(await withBridge.json()).toMatchObject({ bridgeActive: true });
  });

  it("serves HTML scratch artifacts as scratch HTML documents", async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    testDocPath = path.join(tmpDir, ".wc-view-scratch-flow.html");
    fs.writeFileSync(testDocPath, "<section><h1>Payment Flow</h1><p>Styled artifact.</p></section>", "utf-8");
    server = createServer({ port: 0, host: "127.0.0.1", targetPath: testDocPath, queuePath });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const response = await fetch(`${baseUrl}/api/document`);
    expect(await response.json()).toMatchObject({
      path: fs.realpathSync(testDocPath),
      artifactClass: "scratch",
      format: "html",
      content: expect.stringContaining("Payment Flow")
    });
  });

  it("prefers scratch HTML files when serving a directory", async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const markdownPath = path.join(tmpDir, "README.md");
    const htmlPath = path.join(tmpDir, ".wc-view-scratch-flow.html");
    fs.writeFileSync(markdownPath, "# Markdown Fallback", "utf-8");
    fs.writeFileSync(htmlPath, "<main><h1>HTML First</h1></main>", "utf-8");
    server = createServer({ port: 0, host: "127.0.0.1", targetPath: tmpDir, queuePath });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const response = await fetch(`${baseUrl}/api/document`);
    expect(await response.json()).toMatchObject({
      path: fs.realpathSync(htmlPath),
      artifactClass: "scratch",
      format: "html",
      content: expect.stringContaining("HTML First")
    });
  });

  it("includes package dist chunks in static asset candidates", () => {
    const candidates = getStaticAssetCandidates("chunk-example.js", "/tmp/wc-view/dist");

    expect(candidates).toContain(path.join("/tmp/wc-view/dist", "chunk-example.js"));
  });

  it("persists an atomic feedback batch", async () => {
    const response = await fetch(`${baseUrl}/api/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "batch_test",
        prompt: "Improve this",
        notes: [{
          id: "note_1",
          anchor: {
            primary: { exact: "Test paragraph", prefix: "", suffix: "" },
            secondary: { headingSlug: "test-title", elementType: "p", occurrenceIndex: 0 },
            tertiary: { offsetHint: 0 }
          },
          comment: "Clarify the purpose"
        }]
      })
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ artifactClass: "scratch", prompt: "Improve this", notes: [expect.objectContaining({ id: "note_1" })] });
  });

  it("sends batch updates through SSE after an initial snapshot", async () => {
    const streamed = new Promise<Record<string, unknown>>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timed out waiting for a batch event.")), 2_000);
      const request = http.get(`${baseUrl}/api/events`, (response) => {
        let buffer = "";
        response.setEncoding("utf-8");
        response.on("data", (chunk) => {
          buffer += chunk;
          let messageEnd = buffer.indexOf("\n\n");
          while (messageEnd >= 0) {
            const message = buffer.slice(0, messageEnd);
            buffer = buffer.slice(messageEnd + 2);
            if (message.startsWith("event: batch")) {
              clearTimeout(timeout);
              request.destroy();
              resolve(JSON.parse(message.split("\n").find((line) => line.startsWith("data: "))!.slice(6)));
              return;
            }
            messageEnd = buffer.indexOf("\n\n");
          }
        });
      });
      request.on("error", reject);
    });

    await fetch(`${baseUrl}/api/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "batch_sse", prompt: "Start work", notes: [] })
    });

    await expect(streamed).resolves.toMatchObject({ status: "queued", prompt: "Start work" });
  });

  it("serves recursive files and switches document via ?file query parameter", async () => {
    const subDir = path.join(tmpDir, "sub");
    fs.mkdirSync(subDir, { recursive: true });
    const subDoc = path.join(subDir, "nested.md");
    fs.writeFileSync(subDoc, "# Nested Doc\n\nNested content", "utf-8");

    const dirServer = createServer({ port: 0, host: "127.0.0.1", targetPath: tmpDir, queuePath });
    await new Promise<void>((resolve) => dirServer.listen(0, "127.0.0.1", resolve));
    const dirBaseUrl = `http://127.0.0.1:${(dirServer.address() as AddressInfo).port}`;

    try {
      const response = await fetch(`${dirBaseUrl}/api/document`);
      const data = await response.json();
      expect(data.files).toContain("sub/nested.md");

      const switchResponse = await fetch(`${dirBaseUrl}/api/document?file=sub/nested.md`);
      const switchData = await switchResponse.json();
      expect(switchData.path).toBe(fs.realpathSync(subDoc));
      expect(switchData.content).toContain("Nested content");
    } finally {
      await new Promise<void>((resolve) => dirServer.close(() => resolve()));
    }
  });

  it("rejects client target authority and isolates batches by validated document", async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const firstPath = path.join(tmpDir, "first.md");
    const secondPath = path.join(tmpDir, "second.md");
    fs.writeFileSync(firstPath, "# First", "utf-8");
    fs.writeFileSync(secondPath, "# Second", "utf-8");
    server = createServer({ port: 0, host: "127.0.0.1", targetPath: tmpDir, queuePath });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const rejected = await fetch(`${baseUrl}/api/batches?file=first.md`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "bad", prompt: "Bad", notes: [], filePath: secondPath })
    });
    expect(rejected.status).toBe(400);

    for (const file of ["first.md", "second.md"]) {
      const response = await fetch(`${baseUrl}/api/batches?file=${file}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: `batch_${file}`, prompt: file, notes: [] })
      });
      expect(response.status).toBe(201);
    }

    const firstBatches = await (await fetch(`${baseUrl}/api/batches?file=first.md`)).json();
    const secondBatches = await (await fetch(`${baseUrl}/api/batches?file=second.md`)).json();
    expect(firstBatches.map((batch: { id: string }) => batch.id)).toEqual(["batch_first.md"]);
    expect(secondBatches.map((batch: { id: string }) => batch.id)).toEqual(["batch_second.md"]);
    expect(firstBatches[0]).toMatchObject({ filePath: fs.realpathSync(firstPath), sessionId: expect.stringMatching(/^serve_/) });
  });

  it("handles agent replies via POST /api/batches/:id/reply", async () => {
    const createRes = await fetch(`${baseUrl}/api/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "batch_reply_test", prompt: "Fix issue", notes: [] })
    });
    expect(createRes.status).toBe(201);

    const replyRes = await fetch(`${baseUrl}/api/batches/batch_reply_test/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Fixed issue in component", sender: "agent" })
    });
    expect(replyRes.status).toBe(200);
    const replyData = await replyRes.json();
    expect(replyData.replies).toHaveLength(1);
    expect(replyData.replies[0].message).toBe("Fixed issue in component");
  });
});


