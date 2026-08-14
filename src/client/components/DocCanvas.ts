import { renderMarkdown } from "../../core/markdown.js";

export type DocumentFormat = "markdown" | "html";

export interface DocBlock {
  id: string;
  kind: "paragraph" | "heading" | "code";
  text: string;
}

/**
 * Centered document reading canvas component.
 */
export class DocCanvas {
  private container: HTMLElement;
  private blocks: DocBlock[] = [];
  private onBlockSelect?: (block: DocBlock) => void;
  private onDecisionToggle?: (label: string, checked: boolean, blockId: string) => void;

  constructor(containerId: string = "doc-canvas") {
    let existing = document.getElementById(containerId);
    if (!existing) {
      existing = document.createElement("main");
      existing.id = containerId;
      existing.className = "doc-canvas";
      existing.setAttribute("role", "main");
      existing.setAttribute("aria-label", "Document Canvas");
      document.body.appendChild(existing);
    }
    this.container = existing;
  }

  public render(
    content: string,
    title?: string,
    meta?: string,
    onSelect?: (block: DocBlock) => void,
    onDecisionToggleOrFormat?: ((label: string, checked: boolean, blockId: string) => void) | DocumentFormat,
    format: DocumentFormat = "markdown"
  ): void {
    this.onBlockSelect = onSelect;
    if (typeof onDecisionToggleOrFormat === "function") {
      this.onDecisionToggle = onDecisionToggleOrFormat;
    } else if (typeof onDecisionToggleOrFormat === "string") {
      format = onDecisionToggleOrFormat;
      this.onDecisionToggle = undefined;
    } else {
      this.onDecisionToggle = undefined;
    }

    const htmlContent = format === "html" ? this.prepareHtmlContent(content) : renderMarkdown(content);


    const header = title || meta
      ? `<header>${title ? `<h1>${title}</h1>` : ""}${meta ? `<p class="doc-meta">${meta}</p>` : ""}</header>`
      : "";

    this.container.innerHTML = `
      ${header}
      <article id="doc-content">${htmlContent}</article>
    `;

    this.parseAndBindBlocks();
  }


  public markAnnotated(blockId: string, isAnnotated: boolean): void {
    const el = this.container.querySelector(`[data-block-id="${blockId}"]`);
    if (el) {
      el.classList.toggle("annotated", isAnnotated);
    }
  }

  public markActive(blockId: string | null): void {
    const all = this.container.querySelectorAll(".doc-block");
    all.forEach((el) => el.classList.remove("active"));
    if (blockId) {
      const activeEl = this.container.querySelector(`[data-block-id="${blockId}"]`);
      if (activeEl) activeEl.classList.add("active");
    }
  }

  public updateTheme(theme: "dark" | "light"): void {
    const mermaidContainers = this.container.querySelectorAll(".mermaid-block");
    if (mermaidContainers.length === 0) return;

    import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: theme === "light" ? "default" : "dark",
        securityLevel: "loose"
      });
      mermaidContainers.forEach((blockEl) => {
        const rawSource = blockEl.getAttribute("data-mermaid-source");
        if (!rawSource) return;
        const div = document.createElement("div");
        div.className = "mermaid";
        div.textContent = rawSource;
        blockEl.innerHTML = "";
        blockEl.appendChild(div);
        m.default.run({ nodes: [div] }).catch((err) => {
          div.innerHTML = `<div class="mermaid-error" role="alert"><strong>Diagram Syntax Notice:</strong><pre>${rawSource}</pre></div>`;
        });
      });
    }).catch(() => {});
  }

  private parseAndBindBlocks(): void {
    const article = this.container.querySelector("#doc-content");
    if (!article) return;

    const children = Array.from(article.children);
    this.blocks = [];
    const currentTheme = (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark";

    children.forEach((child, index) => {
      if (["STYLE", "SCRIPT", "TEMPLATE", "META", "LINK"].includes(child.tagName)) return;
      const id = `b${index + 1}`;
      child.setAttribute("data-block-id", id);
      child.classList.add("doc-block");
      child.setAttribute("tabindex", "0");
      child.setAttribute("role", "button");

      const block: DocBlock = {
        id,
        kind: child.tagName === "PRE" ? "code" : child.tagName.startsWith("H") ? "heading" : "paragraph",
        text: child.textContent || ""
      };
      this.blocks.push(block);

      // Handle interactive task list checkboxes
      const checkboxes = child.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        const input = cb as HTMLInputElement;
        input.removeAttribute("disabled");
        input.classList.add("interactive-checkbox");
        input.addEventListener("click", (e) => e.stopPropagation());
        input.addEventListener("change", (e) => {
          e.stopPropagation();
          const itemText = input.parentElement?.textContent?.trim() || "";
          if (this.onDecisionToggle) {
            this.onDecisionToggle(itemText, input.checked, id);
          }
        });
      });

      // Handle diff code blocks styling
      const diffCode = child.querySelector("code.language-diff");
      if (diffCode && diffCode.textContent) {
        const lines = diffCode.textContent.split("\n");
        const formatted = lines.map((line) => {
          if (line.startsWith("+")) return `<span class="diff-line diff-add">${escapeHtml(line)}</span>`;
          if (line.startsWith("-")) return `<span class="diff-line diff-del">${escapeHtml(line)}</span>`;
          if (line.startsWith("@@")) return `<span class="diff-line diff-hunk">${escapeHtml(line)}</span>`;
          return `<span class="diff-line">${escapeHtml(line)}</span>`;
        }).join("\n");
        diffCode.innerHTML = formatted;
      }

      // Handle mermaid rendering
      const mermaidCode = child.querySelector("code.language-mermaid");
      if (mermaidCode) {
        const text = mermaidCode.textContent || "";
        child.classList.add("mermaid-block");
        child.setAttribute("data-mermaid-source", text);
        const div = document.createElement("div");
        div.className = "mermaid";
        div.textContent = text;
        child.innerHTML = "";
        child.appendChild(div);

        import("mermaid").then((m) => {
          m.default.initialize({
            startOnLoad: false,
            theme: currentTheme === "light" ? "default" : "dark",
            securityLevel: "loose"
          });
          m.default.run({ nodes: [div] }).catch(() => {
            div.innerHTML = `<div class="mermaid-error" role="alert"><strong>Diagram Syntax Notice:</strong><pre>${escapeHtml(text)}</pre></div>`;
          });
        }).catch(() => {});
      }

      child.addEventListener("click", () => {
        if (this.onBlockSelect) this.onBlockSelect(block);
      });

      child.addEventListener("keydown", (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.target !== child) return;
        if (ke.key === "Enter" || ke.key === " ") {
          ke.preventDefault();
          if (this.onBlockSelect) this.onBlockSelect(block);
        }
      });
    });
  }
  private prepareHtmlContent(html: string): string {
    const trimmed = html.trim();
    if (!/<(?:!doctype|html|head|body)(?:\s|>)/i.test(trimmed)) return trimmed;

    const parsed = new DOMParser().parseFromString(trimmed, "text/html");
    const styles = Array.from(parsed.head.querySelectorAll("style"))
      .map((style) => style.outerHTML)
      .join("\n");
    const body = parsed.body.innerHTML.trim();
    return [styles, body].filter(Boolean).join("\n");
  }
}


function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

