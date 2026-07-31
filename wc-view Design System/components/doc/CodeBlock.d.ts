import type { HTMLAttributes } from 'react';

/** Monospace block for JSON payloads / CLI output. Reserve a height to keep CLS at 0. */
export interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  code: string;
  /** Uppercase caption, e.g. "queue.jsonl". */
  label?: string;
  /** Pre-reserved min-height (CLS guard), e.g. "9rem". */
  reservedHeight?: string;
}
export function CodeBlock(props: CodeBlockProps): JSX.Element;
