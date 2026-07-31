/**
 * Manages accessibility status announcements via aria-live polite region.
 */
export class StatusRegion {
  private element: HTMLElement;

  constructor(elementId: string = "status-region") {
    let existing = document.getElementById(elementId);
    if (!existing) {
      existing = document.createElement("div");
      existing.id = elementId;
      existing.className = "status-region";
      existing.setAttribute("role", "status");
      existing.setAttribute("aria-live", "polite");
      document.body.appendChild(existing);
    }
    this.element = existing;
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public announce(message: string): void {
    this.element.textContent = message;
  }
}
