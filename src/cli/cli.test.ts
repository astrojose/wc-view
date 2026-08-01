import { describe, it, expect, beforeEach, afterEach } from "vitest";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { AddressInfo } from "node:net";
import { createServer } from "../server/index.js";

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
    expect(await response.json()).toMatchObject({ path: testDocPath, artifactClass: "scratch" });
    const client = await fetch(`${baseUrl}/main.js`);
    expect(client.headers.get("cache-control")).toBe("no-store");
    await client.text();
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
});
