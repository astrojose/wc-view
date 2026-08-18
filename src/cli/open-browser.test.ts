import { describe, expect, it } from "vitest";
import { getBrowserOpenCommand } from "./open-browser.js";

describe("getBrowserOpenCommand", () => {
  const url = "http://127.0.0.1:3456";

  it("uses open on macOS", () => {
    expect(getBrowserOpenCommand(url, "darwin")).toEqual({ command: "open", args: [url] });
  });

  it("uses xdg-open on Linux", () => {
    expect(getBrowserOpenCommand(url, "linux")).toEqual({ command: "xdg-open", args: [url] });
  });

  it("uses start through cmd on Windows", () => {
    expect(getBrowserOpenCommand(url, "win32")).toEqual({ command: "cmd", args: ["/c", "start", "", url] });
  });
});
