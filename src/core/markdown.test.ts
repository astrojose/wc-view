import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown.js";

describe("Markdown Renderer", () => {
  it("renders headers and paragraphs correctly", () => {
    const input = "# Title\n\nParagraph text";
    const html = renderMarkdown(input);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<p>Paragraph text</p>");
  });

  it("renders GFM tables and task lists", () => {
    const input = "- [x] Done task\n\n| Col 1 | Col 2 |\n|---|---|";
    const html = renderMarkdown(input);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("<table>");
  });
});
