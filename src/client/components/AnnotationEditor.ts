import { DocBlock } from "./DocCanvas.js";

/**
 * Inline annotation editor popover attached to a selected document block.
 */
export class AnnotationEditor {
  private popoverEl: HTMLElement | null = null;
  private invokerElement: HTMLElement | null = null;

  public open(
    targetBlock: DocBlock,
    targetElement: HTMLElement,
    onSave: (quote: string, comment: string) => void,
    onCancel: () => void
  ): void {
    this.close();
    this.invokerElement = targetElement;

    const quote = targetBlock.text.split(" ").slice(0, 5).join(" ");

    this.popoverEl = document.createElement("div");
    this.popoverEl.className = "annotation-popover";
    this.popoverEl.setAttribute("role", "dialog");
    this.popoverEl.setAttribute("aria-modal", "false");
    this.popoverEl.setAttribute("aria-label", "Add review note");

    this.popoverEl.innerHTML = `
      <span class="annotation-label">Review note</span>
      <blockquote class="annotation-quote">${quote}…</blockquote>
      <textarea id="annotation-comment-input" class="composer-input" rows="3" placeholder="What should the agent change here?"></textarea>
      <div style="display:flex;justify-content:flex-end;gap:var(--space-2)">
        <button id="annotation-cancel-btn" class="btn btn-ghost btn-sm" type="button">Cancel</button>
        <button id="annotation-save-btn" class="btn btn-primary btn-sm" type="button">Attach Note</button>
      </div>
    `;

    targetElement.appendChild(this.popoverEl);
    this.popoverEl.addEventListener("click", (e) => e.stopPropagation());

    const input = this.popoverEl.querySelector("#annotation-comment-input") as HTMLTextAreaElement;
    const saveBtn = this.popoverEl.querySelector("#annotation-save-btn") as HTMLButtonElement;
    const cancelBtn = this.popoverEl.querySelector("#annotation-cancel-btn") as HTMLButtonElement;

    input.focus();

    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
        onCancel();
      }
    });

    saveBtn.addEventListener("click", () => {
      onSave(quote, input.value.trim());
      this.close();
    });

    cancelBtn.addEventListener("click", () => {
      this.close();
      onCancel();
    });
  }

  public close(): void {
    if (this.popoverEl && this.popoverEl.parentNode) {
      this.popoverEl.parentNode.removeChild(this.popoverEl);
      this.popoverEl = null;
    }
    if (this.invokerElement) {
      this.invokerElement.focus();
      this.invokerElement = null;
    }
  }
}
