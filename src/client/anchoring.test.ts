// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";

import { extractAnchor, resolveAnchor } from "./anchoring.js";

describe("Anchoring Engine", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    root.innerHTML = `
      <h2 id="intro">Introduction</h2>
      <p>This is the first paragraph with important details.</p>
      <p>This is the second paragraph with more information.</p>
    `;
    document.body.appendChild(root);
  });

  it("extracts 3-tier anchor metadata correctly", () => {
    const target = root.querySelectorAll("p")[0];
    const anchor = extractAnchor(target, root);

    expect(anchor.primary.exact).toBe("This is the first paragraph with important details.");
    expect(anchor.secondary.headingSlug).toBe("introduction");
    expect(anchor.secondary.elementType).toBe("p");
    expect(anchor.secondary.occurrenceIndex).toBe(0);
  });

  it("resolves primary quote anchor successfully", () => {
    const target = root.querySelectorAll("p")[1];
    const anchor = extractAnchor(target, root);
    const resolved = resolveAnchor(anchor, root);

    expect(resolved.status).toBe("resolved");
    expect(resolved.element).toBe(target);
  });

  it("uses the selected heading as its own structural scope", () => {
    const target = root.querySelector("h2");
    const anchor = extractAnchor(target!, root);

    expect(anchor.primary.exact).toBe("Introduction");
    expect(anchor.secondary.headingSlug).toBe("introduction");
    expect(anchor.secondary.elementType).toBe("h2");
    expect(anchor.secondary.occurrenceIndex).toBe(0);
  });

  it("marks missing anchor as orphaned", () => {
    const dummyAnchor = {
      primary: { exact: "Non-existent text quote", prefix: "", suffix: "" },
      secondary: { headingSlug: "unknown", elementType: "p", occurrenceIndex: 99 },
      tertiary: { offsetHint: -1 }
    };

    const resolved = resolveAnchor(dummyAnchor, root);
    expect(resolved.status).toBe("orphaned");
    expect(resolved.element).toBeNull();
  });
});
