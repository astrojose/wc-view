import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "./markdown.js";

/**
 * Generate a standalone, self-contained HTML string from Markdown.
 */
export function exportStandaloneHtml(markdown: string, title: string = "Document Review"): string {
  const renderedContent = renderMarkdown(markdown);

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — wc-view Export</title>
  <style>
    :root {
      --bg-base: #0f172a;
      --surface-card: #1e293b;
      --surface-raised: #334155;
      --surface-inset: #090d16;
      --fg-primary: #f8fafc;
      --fg-secondary: #cbd5e1;
      --fg-muted: #64748b;
      --border-subtle: #334155;
      --border-strong: #475569;
      --accent-action: #2563eb;
      --accent-action-fg: #ffffff;
      --annotation-bar: #38bdf8;
      --annotation-tint: rgba(56, 189, 248, 0.08);
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --measure-doc-max: 52rem;
    }

    [data-theme="light"] {
      --bg-base: #f8fafc;
      --surface-card: #ffffff;
      --surface-raised: #f1f5f9;
      --surface-inset: #e2e8f0;
      --fg-primary: #0f172a;
      --fg-secondary: #334155;
      --fg-muted: #64748b;
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --accent-action: #2563eb;
      --accent-action-fg: #ffffff;
      --annotation-bar: #0284c7;
      --annotation-tint: rgba(2, 132, 199, 0.08);
    }

    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background-color: var(--bg-base);
      color: var(--fg-primary);
      font-family: var(--font-sans);
      line-height: 1.6;
    }

    .doc-canvas {
      width: 100%;
      max-width: var(--measure-doc-max);
      margin: 0 auto;
      padding: 2.5rem 1.5rem 5rem;
    }

    .export-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background-color: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.875rem;
      color: var(--fg-secondary);
    }

    .theme-toggle-btn {
      background: var(--surface-raised);
      border: 1px solid var(--border-strong);
      color: var(--fg-primary);
      padding: 0.35rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.8125rem;
    }

    h1, h2, h3, h4, h5, h6 { color: var(--fg-primary); margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; }
    a { color: var(--annotation-bar); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { font-family: var(--font-mono); background: var(--surface-inset); padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; }
    pre { background: var(--surface-inset); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid var(--border-subtle); padding: 0.6rem 0.8rem; text-align: left; }
    th { background: var(--surface-card); font-weight: 600; }
    blockquote { border-left: 4px solid var(--annotation-bar); margin: 1rem 0; padding: 0.5rem 1rem; background: var(--annotation-tint); color: var(--fg-secondary); }
    hr { border: none; border-top: 1px solid var(--border-subtle); margin: 2rem 0; }

    /* Diff styling */
    .diff-add { background-color: rgba(34, 197, 94, 0.15); color: #22c55e; display: block; }
    .diff-del { background-color: rgba(239, 68, 68, 0.15); color: #ef4444; display: block; }
    .diff-hunk { color: var(--fg-muted); font-style: italic; display: block; }
  </style>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default' });

    document.querySelectorAll('pre code.language-mermaid').forEach((block) => {
      const pre = block.parentElement;
      const text = block.textContent;
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = text;
      pre.replaceWith(div);
    });
    mermaid.run();

    window.toggleTheme = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.getElementById('theme-btn-text').textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    };
  </script>
</head>
<body>
  <div class="doc-canvas" role="main">
    <div class="export-banner">
      <span><strong>wc-view Standalone Export</strong> &bull; ${escapeHtml(title)}</span>
      <button class="theme-toggle-btn" onclick="window.toggleTheme()"><span id="theme-btn-text">☀️ Light</span></button>
    </div>
    <article id="doc-content">
      ${renderedContent}
    </article>
  </div>
</body>
</html>`;
}

/**
 * Export a Markdown file to a standalone HTML file.
 */
export function exportMarkdownFile(filePath: string, outPath?: string): string {
  const absoluteInput = path.resolve(filePath);
  if (!fs.existsSync(absoluteInput)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(absoluteInput, "utf-8");
  const title = path.basename(absoluteInput, path.extname(absoluteInput));
  const html = exportStandaloneHtml(content, title);

  const destination = outPath
    ? path.resolve(outPath)
    : path.join(path.dirname(absoluteInput), `${title}.html`);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html, "utf-8");
  return destination;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
