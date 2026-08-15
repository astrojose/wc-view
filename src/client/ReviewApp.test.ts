// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  private listeners = new Map<string, Array<(event: MessageEvent) => void>>();

  constructor(public readonly url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) || []), listener]);
  }

  close(): void {
    // No-op for tests.
  }

  emit(type: string, payload: unknown): void {
    const event = { data: JSON.stringify(payload) } as MessageEvent;
    for (const listener of this.listeners.get(type) || []) listener(event);
  }
}

describe("ReviewApp streamed refresh", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    document.body.innerHTML = '<div id="doc-canvas" class="doc-canvas" role="main" aria-label="Document Canvas"></div>';
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  it("refreshes the served document once after an applied batch arrives", async () => {
    let documentContent = "<h1>Original flow</h1>";
    let documentFetches = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/document") {
        documentFetches++;
        return {
          ok: true,
          json: async () => ({
            path: "/workspace/.wc-view-scratch.html",
            content: documentContent,
            format: "html",
            artifactClass: "scratch"
          })
        } as Response;
      }
      if (url === "/api/feedback" || url === "/api/batches") {
        return { ok: true, json: async () => [] } as Response;
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await import("./main.js");
    await Promise.resolve();
    await Promise.resolve();

    expect(document.querySelector("#doc-content")?.textContent).toContain("Original flow");
    expect(FakeEventSource.instances).toHaveLength(1);

    const appliedBatch = {
      id: "batch_refresh",
      filePath: "/workspace/.wc-view-scratch.html",
      artifactClass: "scratch",
      status: "applied",
      result: { summary: "Artifact updated", status: "applied" },
      createdAt: "2026-08-01T18:00:00.000Z"
    };

    documentContent = "<h1>Updated flow</h1>";
    FakeEventSource.instances[0].emit("batch", appliedBatch);
    await Promise.resolve();
    await Promise.resolve();

    expect(document.querySelector("#doc-content")?.textContent).toContain("Updated flow");
    expect(documentFetches).toBe(2);

    FakeEventSource.instances[0].emit("batch", appliedBatch);
    await Promise.resolve();
    await Promise.resolve();

    expect(documentFetches).toBe(2);
  });

  it("aligns canvas and theme-toggle width with the served document format", async () => {
    let documentContent = "<h1>Artifact</h1>";
    let documentFormat = "html";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/document") {
        return {
          ok: true,
          json: async () => ({
            path: "/workspace/.wc-view-scratch.html",
            content: documentContent,
            format: documentFormat,
            artifactClass: "scratch"
          })
        } as Response;
      }
      if (url === "/api/feedback" || url === "/api/batches") {
        return { ok: true, json: async () => [] } as Response;
      }
      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    await import("./main.js");
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById("doc-canvas")?.classList.contains("is-html")).toBe(true);
    expect(document.getElementById("theme-toggle")?.classList.contains("is-html")).toBe(true);

    documentFormat = "markdown";
    documentContent = "# Markdown";
    fetchMock.mockClear();
    const app = (window as unknown as { reviewApp: { renderDocument: (c: string, t?: string, m?: string, f?: "markdown" | "html") => void } }).reviewApp;
    app.renderDocument("# Markdown", undefined, undefined, "markdown");

    expect(document.getElementById("doc-canvas")?.classList.contains("is-html")).toBe(false);
    expect(document.getElementById("theme-toggle")?.classList.contains("is-html")).toBe(false);
  });
});
