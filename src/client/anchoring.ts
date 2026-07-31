export interface PrimaryAnchor {
  exact: string;
  prefix: string;
  suffix: string;
}

export interface SecondaryAnchor {
  headingSlug?: string;
  elementType: string;
  occurrenceIndex: number;
}

export interface TertiaryAnchor {
  startLine?: number;
  endLine?: number;
  offsetHint?: number;
}

export interface AnchorData {
  primary: PrimaryAnchor;
  secondary: SecondaryAnchor;
  tertiary: TertiaryAnchor;
}

/**
 * Extracts 3-tier anchor metadata for a DOM element or text selection.
 */
export function extractAnchor(el: HTMLElement, root: HTMLElement): AnchorData {
  const text = el.textContent || "";
  const rootText = root.textContent || "";
  const offset = rootText.indexOf(text);
  const prefix = offset > 0 ? rootText.slice(Math.max(0, offset - 32), offset) : "";
  const suffix = offset >= 0 ? rootText.slice(offset + text.length, offset + text.length + 32) : "";

  // Secondary structural scope: nearest heading & element occurrence index
  let headingSlug: string | undefined;
  let prev = el.previousElementSibling;
  while (prev) {
    if (/^H[1-6]$/.test(prev.tagName)) {
      headingSlug = prev.textContent?.toLowerCase().replace(/[^\w]+/g, "-") || undefined;
      break;
    }
    prev = prev.previousElementSibling;
  }

  const tagName = el.tagName.toLowerCase();
  const siblings = Array.from(root.querySelectorAll(tagName));
  const occurrenceIndex = siblings.indexOf(el);

  return {
    primary: { exact: text.slice(0, 200), prefix, suffix },
    secondary: { headingSlug, elementType: tagName, occurrenceIndex: occurrenceIndex >= 0 ? occurrenceIndex : 0 },
    tertiary: { offsetHint: offset >= 0 ? offset : 0 }
  };
}

/**
 * Resolves anchor data against the DOM using primary, secondary, and tertiary fallback chain.
 */
export function resolveAnchor(anchor: AnchorData, root: HTMLElement): { element: HTMLElement | null; status: "resolved" | "orphaned" } {
  if (!anchor || !anchor.primary || !anchor.primary.exact) {
    return { element: null, status: "orphaned" };
  }

  const exact = anchor.primary.exact;

  // 1. Primary resolution: exact quote match
  const elements = Array.from(root.querySelectorAll<HTMLElement>("p, h1, h2, h3, h4, h5, h6, pre, li, blockquote"));
  for (const el of elements) {
    if (el.textContent && el.textContent.includes(exact)) {
      return { element: el, status: "resolved" };
    }
  }

  // 2. Secondary resolution: structural scope match
  if (anchor.secondary) {
    const matchingType = Array.from(root.querySelectorAll<HTMLElement>(anchor.secondary.elementType || "p"));
    const candidate = matchingType[anchor.secondary.occurrenceIndex];
    if (candidate && candidate.textContent && candidate.textContent.length > 0) {
      return { element: candidate, status: "resolved" };
    }
  }

  // 3. Unresolved anchor
  return { element: null, status: "orphaned" };
}
