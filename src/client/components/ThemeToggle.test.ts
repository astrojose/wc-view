// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeToggle } from "./ThemeToggle.js";

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("sets initial theme attribute on document root", () => {
    const toggle = new ThemeToggle("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(toggle.getTheme()).toBe("dark");
  });

  it("toggles between dark and light themes", () => {
    const toggle = new ThemeToggle("dark");
    toggle.toggle();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(toggle.getTheme()).toBe("light");

    toggle.toggle();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(toggle.getTheme()).toBe("dark");
  });
});
