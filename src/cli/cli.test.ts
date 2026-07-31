import { describe, it, expect, beforeEach, afterEach } from "vitest";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createServer } from "../server/index.js";
import { writeFeedbackItem, FeedbackItem } from "../core/queue.js";

describe("Server & CLI Integration", () => {
  let server: http.Server;
  let tmpDir: string;
  let testDocPath: string;
  const port = 3987;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wc-view-server-test-"));
    testDocPath = path.join(tmpDir, "test.md");
    fs.writeFileSync(testDocPath, "# Test Title\n\nTest paragraph content.", "utf-8");

    server = createServer({ port, host: "127.0.0.1", targetPath: testDocPath });
  });

  afterEach((done) => {
    if (server) {
      server.close(() => {
        if (fs.existsSync(tmpDir)) {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        }
      });
    }
  });

  it("serves document API endpoint cleanly", async () => {
    await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));

    const res = await fetch(`http://127.0.0.1:${port}/api/document`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.path).toBe(testDocPath);
    expect(data.content).toContain("Test paragraph content.");
  });

  it("accepts feedback POST request on loopback", async () => {
    await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));

    const sampleItem: Partial<FeedbackItem> = {
      id: "fb_test_100",
      filePath: testDocPath,
      anchor: {
        primary: { exact: "Test paragraph", prefix: "", suffix: "" },
        secondary: { headingSlug: "test-title", elementType: "p", occurrenceIndex: 0 },
        tertiary: { offsetHint: 0 }
      },
      comment: "Test comment from API",
      status: "unresolved"
    };

    const res = await fetch(`http://127.0.0.1:${port}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleItem)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("fb_test_100");
    expect(data.comment).toBe("Test comment from API");
  });
});
