/**
 * Manages dark/light theme switching bound to data-theme attribute.
 */
export class ThemeToggle {
  private currentTheme: "dark" | "light";

  constructor(initialTheme: "dark" | "light" = "dark") {
    this.currentTheme = initialTheme;
    this.applyTheme(this.currentTheme);
  }

  public toggle(): "dark" | "light" {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(this.currentTheme);
    return this.currentTheme;
  }

  public setTheme(theme: "dark" | "light"): void {
    this.currentTheme = theme;
    this.applyTheme(this.currentTheme);
  }

  public getTheme(): "dark" | "light" {
    return this.currentTheme;
  }

  private applyTheme(theme: "dark" | "light"): void {
    document.documentElement.dataset.theme = theme;
  }
}
