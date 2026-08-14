import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { exportStandaloneHtml, exportMarkdownFile } from "./export.js";

describe("Standalone HTML Export Engine", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wc-view-export-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates a self-contained HTML document string with styles and semantic elements", () => {
    const md = "# Architecture Overview\n\nThis is a review doc with **bold** text and `code`.\n\n```mermaid\ngraph TD;\nA-->B;\n```";
    const html = exportStandaloneHtml(md, "Architecture");

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>Architecture — wc-view Export</title>");
    expect(html).toContain("<h1>Architecture Overview</h1>");
    expect(html).toContain("language-mermaid");
    expect(html).toContain("<style>");
    expect(html).toContain("--bg-base");
    expect(html).toContain("toggleTheme");
  });

  it("exports a markdown file to a standalone .html file at specified output path", () => {
    const srcDoc = path.join(tmpDir, "spec.md");
    const outHtml = path.join(tmpDir, "dist", "spec.html");
    fs.writeFileSync(srcDoc, "# Feature Spec\n\n- [x] Done\n- [ ] Pending", "utf-8");

    const resultPath = exportMarkdownFile(srcDoc, outHtml);
    expect(resultPath).toBe(outHtml);
    expect(fs.existsSync(outHtml)).toBe(true);

    const content = fs.readFileSync(outHtml, "utf-8");
    expect(content).toContain("<h1>Feature Spec</h1>");
    expect(content).toContain("<ul");
  });
});
