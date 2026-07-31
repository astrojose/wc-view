/**
 * Manages accessibility status announcements via aria-live polite region.
 */
export class StatusRegion {
  private element: HTMLElement;
  private messageEl: HTMLElement;

  constructor(elementId: string = "status-region") {
    let existing = document.getElementById(elementId);
    if (!existing) {
      existing = document.createElement("p");
      existing.id = elementId;
      existing.className = "status-region";
      existing.setAttribute("role", "status");
      existing.setAttribute("aria-live", "polite");
      existing.innerHTML = `<span aria-hidden="true">›</span><span class="status-message"></span>`;
      document.body.appendChild(existing);
    }
    this.element = existing;
    this.messageEl = existing.querySelector(".status-message") || existing;
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public announce(message: string): void {
    this.messageEl.textContent = message;
  }
}
