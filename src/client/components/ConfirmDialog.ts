/**
 * Destructive confirmation modal dialog with focus trapping and focus restoration.
 */
export class ConfirmDialog {
  private scrim: HTMLElement | null = null;
  private invokerElement: HTMLElement | null = null;

  public show(
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    this.invokerElement = document.activeElement as HTMLElement;

    this.scrim = document.createElement("div");
    this.scrim.className = "dialog-scrim";
    this.scrim.setAttribute("role", "dialog");
    this.scrim.setAttribute("aria-modal", "true");
    this.scrim.setAttribute("aria-labelledby", "confirm-dialog-title");

    this.scrim.innerHTML = `
      <div class="dialog-card">
        <h3 id="confirm-dialog-title" style="margin:0">${title}</h3>
        <p style="margin:0;color:var(--fg-secondary)">${description}</p>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-2);margin-top:var(--space-2)">
          <button id="dialog-cancel-btn" class="btn">Cancel</button>
          <button id="dialog-confirm-btn" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.scrim);

    const cancelBtn = this.scrim.querySelector("#dialog-cancel-btn") as HTMLButtonElement;
    const confirmBtn = this.scrim.querySelector("#dialog-confirm-btn") as HTMLButtonElement;

    cancelBtn.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
        if (onCancel) onCancel();
      } else if (e.key === "Tab") {
        const focusables = [cancelBtn, confirmBtn];
        const idx = focusables.indexOf(document.activeElement as HTMLButtonElement);
        if (e.shiftKey && idx === 0) {
          e.preventDefault();
          confirmBtn.focus();
        } else if (!e.shiftKey && idx === focusables.length - 1) {
          e.preventDefault();
          cancelBtn.focus();
        }
      }
    };

    this.scrim.addEventListener("keydown", handleKeyDown);

    cancelBtn.addEventListener("click", () => {
      this.close();
      if (onCancel) onCancel();
    });

    confirmBtn.addEventListener("click", () => {
      this.close();
      onConfirm();
    });
  }

  public close(): void {
    if (this.scrim && this.scrim.parentNode) {
      this.scrim.parentNode.removeChild(this.scrim);
      this.scrim = null;
    }
    if (this.invokerElement) {
      this.invokerElement.focus();
      this.invokerElement = null;
    }
  }
}
