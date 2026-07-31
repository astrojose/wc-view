import { renderMarkdown } from "../../core/markdown.js";

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

  public render(markdown: string, title?: string, meta?: string, onSelect?: (block: DocBlock) => void): void {
    this.onBlockSelect = onSelect;
    const htmlContent = renderMarkdown(markdown);

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

  private parseAndBindBlocks(): void {
    const article = this.container.querySelector("#doc-content");
    if (!article) return;

    const children = Array.from(article.children);
    this.blocks = [];

    children.forEach((child, index) => {
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
}
