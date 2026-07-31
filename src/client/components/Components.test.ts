// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { DocCanvas } from "./DocCanvas.js";
import { StatusRegion } from "./StatusRegion.js";
import { FloatingComposer } from "./FloatingComposer.js";

describe("Phase 1 & 2 Client Components", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders DocCanvas in centered column with role main", () => {
    const canvas = new DocCanvas("test-canvas");
    canvas.render("# Hello World\n\nSome text.", "Test Title");

    const element = document.getElementById("test-canvas");
    expect(element).not.toBeNull();
    expect(element?.getAttribute("role")).toBe("main");
    expect(element?.textContent).toContain("Test Title");
    expect(element?.textContent).toContain("Some text.");
  });

  it("does not reopen block selection when Space is typed inside a nested input", () => {
    const canvas = new DocCanvas("test-canvas");
    let selectedCount = 0;

    canvas.render("Some text.", "Test Title", undefined, () => {
      selectedCount++;
    });

    const block = document.querySelector("[data-block-id='b1']") as HTMLElement;
    const nestedInput = document.createElement("textarea");
    block.appendChild(nestedInput);

    nestedInput.dispatchEvent(new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true
    }));

    expect(selectedCount).toBe(0);
  });

  it("announces messages in StatusRegion with aria-live polite", () => {
    const status = new StatusRegion("test-status");
    status.announce("Note attached.");

    const element = document.getElementById("test-status");
    expect(element?.getAttribute("role")).toBe("status");
    expect(element?.getAttribute("aria-live")).toBe("polite");
    expect(element?.textContent).toContain("Note attached.");
  });

  it("manages floating composer notes and chip badge", () => {
    const composer = new FloatingComposer();
    composer.addNote({
      id: "n1",
      blockId: "b1",
      quote: "Some text",
      comment: "Fix typo",
      status: "unresolved"
    });

    expect(composer.getNotes().length).toBe(1);

    const badge = document.getElementById("chip-badge");
    expect(badge?.textContent).toContain("1 note attached");

    composer.removeNote("n1");
    expect(composer.getNotes().length).toBe(0);
    expect(badge?.textContent).toContain("0 notes attached");
  });
});
