import { marked } from "marked";

export function renderMarkdown(markdownContent: string): string {
  return marked.parse(markdownContent) as string;
}
