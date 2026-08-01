// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { DocCanvas } from "./DocCanvas.js";
import { StatusRegion } from "./StatusRegion.js";
import { FloatingComposer } from "./FloatingComposer.js";
import { AnnotationEditor } from "./AnnotationEditor.js";
import { ConfirmDialog } from "./ConfirmDialog.js";
import { getBatchSubmitStatus } from "../batchStatus.js";

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

  it("converts mermaid code blocks into dynamic visualization divs", () => {
    const canvas = new DocCanvas("test-mermaid-canvas");
    canvas.render("```mermaid\ngraph TD;\nA-->B;\n```");

    const element = document.getElementById("test-mermaid-canvas");
    const mermaidDiv = element?.querySelector("div.mermaid");
    expect(mermaidDiv).not.toBeNull();
    expect(mermaidDiv?.textContent).toContain("A-->B;");
  });

  it("renders HTML artifacts without Markdown parsing", () => {
    const canvas = new DocCanvas("test-html-canvas");
    canvas.render("<section><h2>Flow</h2><p><strong>Styled</strong> artifact.</p></section>", "Artifact", undefined, undefined, "html");

    const element = document.getElementById("test-html-canvas");
    expect(element?.querySelector("section h2")?.textContent).toBe("Flow");
    expect(element?.querySelector("strong")?.textContent).toBe("Styled");
    expect(element?.textContent).not.toContain("<section>");
  });

  it("preserves inline styles from full HTML artifact documents", () => {
    const canvas = new DocCanvas("test-full-html-canvas");
    canvas.render("<!doctype html><html><head><style>.hero{color:red}</style></head><body><main class=\"hero\">Artifact</main></body></html>", undefined, undefined, undefined, "html");

    const element = document.getElementById("test-full-html-canvas");
    expect(element?.querySelector("style")?.textContent).toContain(".hero");
    expect(element?.querySelector("main.hero")?.textContent).toBe("Artifact");
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

  it("mounts StatusRegion before the document canvas for sticky top display", () => {
    const canvas = document.createElement("main");
    canvas.id = "doc-canvas";
    document.body.appendChild(canvas);

    new StatusRegion("test-status");

    expect(document.body.firstElementChild?.id).toBe("test-status");
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
    expect(badge?.textContent).not.toContain("🏷️");

    composer.removeNote("n1");
    expect(composer.getNotes().length).toBe(0);
    expect(badge?.textContent).toContain("0 notes attached");
  });

  it("uses design-system layout classes instead of inline composer layout styles", () => {
    new FloatingComposer();

    expect(document.querySelector(".composer-summary-row")).not.toBeNull();
    expect(document.querySelector(".composer-actions")).not.toBeNull();
    expect(document.querySelector(".floating-composer-bar [style]")).toBeNull();
  });

  it("uses a classed annotation action row", () => {
    const target = document.createElement("p");
    document.body.appendChild(target);
    const editor = new AnnotationEditor();
    editor.open({ id: "b1", kind: "paragraph", text: "Some text." }, target, () => {}, () => {});

    expect(document.querySelector(".annotation-actions")).not.toBeNull();
    expect(document.querySelector(".annotation-popover [style]")).toBeNull();
  });

  it("uses a classed dialog action row", () => {
    const dialog = new ConfirmDialog();
    dialog.show("Discard notes?", "Unsubmitted notes are never written.", () => {});

    expect(document.querySelector(".dialog-actions")).not.toBeNull();
    expect(document.querySelector(".dialog-card [style]")).toBeNull();
  });

  it("clears queued notes after submit", async () => {
    const onSubmit = vi.fn();
    const composer = new FloatingComposer(onSubmit);

    composer.addNote({
      id: "n1",
      blockId: "b1",
      quote: "Some text",
      comment: "Fix typo",
      status: "unresolved"
    });

    const submitButton = document.getElementById("submit-btn") as HTMLButtonElement;
    submitButton.click();

    const badge = document.getElementById("chip-badge");
    expect(onSubmit).toHaveBeenCalledWith("", [
      {
        id: "n1",
        blockId: "b1",
        quote: "Some text",
        comment: "Fix typo",
        status: "unresolved"
      }
    ]);
    expect(composer.getNotes().length).toBe(0);
    expect(badge?.textContent).toContain("0 notes attached");
  });

  it("formats submitted state instead of prepared state after batch submit", () => {
    const message = getBatchSubmitStatus("", 1);

    expect(message).toBe("Sent 1 note to the agent work queue.");
    expect(message).not.toContain("prepared for atomic submission");
  });
});
