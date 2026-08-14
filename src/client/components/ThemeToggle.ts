/**
 * Manages dark/light theme switching bound to data-theme attribute,
 * and mounts a small in-flow icon-button control (never fixed/floating —
 * DocCanvas reserves the only overlay for the floating composer).
 */
export class ThemeToggle {
  private currentTheme: "dark" | "light";
  private button: HTMLButtonElement | null = null;
  private icon: HTMLElement | null = null;
  private label: HTMLElement | null = null;
  private onChange?: (theme: "dark" | "light") => void;

  constructor(initialTheme: "dark" | "light" = "dark", mount: boolean = true, onChange?: (theme: "dark" | "light") => void) {
    this.currentTheme = initialTheme;
    this.onChange = onChange;
    this.applyTheme(this.currentTheme);
    if (mount && typeof document !== "undefined") {
      this.mountControl();
    }
  }

  public toggle(): "dark" | "light" {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(this.currentTheme);
    this.updateControl();
    this.onChange?.(this.currentTheme);
    return this.currentTheme;
  }

  public setTheme(theme: "dark" | "light"): void {
    this.currentTheme = theme;
    this.applyTheme(this.currentTheme);
    this.updateControl();
    this.onChange?.(this.currentTheme);
  }


  public getTheme(): "dark" | "light" {
    return this.currentTheme;
  }

  private applyTheme(theme: "dark" | "light"): void {
    document.documentElement.dataset.theme = theme;
  }

  private mountControl(elementId: string = "theme-toggle"): void {
    let existing = document.getElementById(elementId);
    if (!existing) {
      existing = document.createElement("span");
      existing.id = elementId;
      existing.className = "theme-toggle";
      existing.innerHTML = `
        <button type="button" class="icon-btn" id="theme-toggle-btn"><span aria-hidden="true"></span></button>
        <span class="theme-toggle-label"></span>
      `;
      document.body.insertBefore(existing, document.body.firstChild);
    }

    this.button = existing.querySelector("#theme-toggle-btn");
    this.icon = existing.querySelector(".icon-btn span");
    this.label = existing.querySelector(".theme-toggle-label");

    this.button?.addEventListener("click", () => this.toggle());
    this.updateControl();
  }

  private updateControl(): void {
    if (!this.button) return;
    const next = this.currentTheme === "dark" ? "light" : "dark";
    this.button.setAttribute("aria-label", `Switch to ${next} theme`);
    this.button.title = `Switch to ${next} theme`;
    if (this.icon) this.icon.textContent = this.currentTheme === "dark" ? "◐" : "◑";
    if (this.label) this.label.textContent = this.currentTheme;
  }
}
