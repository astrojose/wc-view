/**
 * Accessible keyboard shortcut help dialog component.
 */
export class HelpDialog {
  private element: HTMLElement;
  private isOpen: boolean = false;

  constructor() {
    let existing = document.getElementById("help-dialog-container");
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "help-dialog-container";
      document.body.appendChild(existing);
    }
    this.element = existing;
    this.render();
  }

  public show(): void {
    this.isOpen = true;
    const dialog = this.element.querySelector(".help-dialog") as HTMLElement;
    if (dialog) {
      dialog.classList.add("visible");
      dialog.setAttribute("aria-hidden", "false");
      const closeBtn = dialog.querySelector(".help-close-btn") as HTMLElement;
      closeBtn?.focus();
    }
  }

  public hide(): void {
    this.isOpen = false;
    const dialog = this.element.querySelector(".help-dialog") as HTMLElement;
    if (dialog) {
      dialog.classList.remove("visible");
      dialog.setAttribute("aria-hidden", "true");
    }
  }

  public toggle(): void {
    if (this.isOpen) this.hide();
    else this.show();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="help-backdrop" aria-hidden="true"></div>
      <div class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-dialog-title" aria-hidden="true">
        <div class="help-header">
          <h2 id="help-dialog-title">Keyboard Shortcuts</h2>
          <button class="help-close-btn" aria-label="Close shortcut help">&times;</button>
        </div>
        <div class="help-body">
          <table class="shortcuts-table">
            <tbody>
              <tr>
                <td><kbd>?</kbd> or <kbd>Shift + /</kbd></td>
                <td>Toggle this keyboard shortcuts menu</td>
              </tr>
              <tr>
                <td><kbd>Cmd/Ctrl</kbd> + <kbd>Enter</kbd></td>
                <td>Submit feedback batch to agent</td>
              </tr>
              <tr>
                <td><kbd>Esc</kbd></td>
                <td>Close open modals, cancel active block selection</td>
              </tr>
              <tr>
                <td><kbd>Tab</kbd> / <kbd>Shift + Tab</kbd></td>
                <td>Navigate selectable text blocks & controls</td>
              </tr>
              <tr>
                <td><kbd>Enter</kbd> / <kbd>Space</kbd></td>
                <td>Select highlighted block to attach review note</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const closeBtn = this.element.querySelector(".help-close-btn");
    closeBtn?.addEventListener("click", () => this.hide());

    const backdrop = this.element.querySelector(".help-backdrop");
    backdrop?.addEventListener("click", () => this.hide());

    window.addEventListener("keydown", (e) => {
      if (this.isOpen && e.key === "Escape") {
        e.preventDefault();
        this.hide();
      }
    });
  }
}
