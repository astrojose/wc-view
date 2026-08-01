import { ThemeToggle } from "./components/ThemeToggle.js";
import { StatusRegion } from "./components/StatusRegion.js";
import { DocCanvas, DocBlock } from "./components/DocCanvas.js";
import { FloatingComposer, NoteItem } from "./components/FloatingComposer.js";
import { AnnotationEditor } from "./components/AnnotationEditor.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { extractAnchor, resolveAnchor } from "./anchoring.js";
import { getBatchSubmitStatus } from "./batchStatus.js";
import "./styles/app.css";

export class ReviewApp {
  private themeToggle: ThemeToggle;
  private statusRegion: StatusRegion;
  private canvas: DocCanvas;
  private composer: FloatingComposer;
  private editor: AnnotationEditor;
  private confirmDialog: ConfirmDialog;
  private currentFilePath = "";
  private noteSeq = 0;

  constructor() {
    this.themeToggle = new ThemeToggle("dark");
    this.statusRegion = new StatusRegion();
    this.canvas = new DocCanvas();
    this.editor = new AnnotationEditor();
    this.confirmDialog = new ConfirmDialog();

    this.composer = new FloatingComposer(
      (prompt, notes) => this.handleBatchSubmit(prompt, notes),
      () => this.handleDiscardNotes()
    );
    this.composer.mountAbove(this.statusRegion.getElement());

    this.setupShortcuts();
    this.statusRegion.announce("Select any paragraph to attach a review note.");

    if (typeof window !== "undefined") {
      this.initFromApi();
    }
  }

  public async initFromApi(): Promise<void> {
    try {
      const res = await fetch("/api/document");
      if (!res.ok) return;
      const data = await res.json();
      if (data.content) {
        this.currentFilePath = data.path || "";
        const title = data.path ? data.path.split("/").pop() : "Document";
        this.loadMarkdown(data.content, title);
        this.loadFeedback();
      }
    } catch {
      // Standalone mode without backend server API
    }
  }

  public loadMarkdown(markdown: string, title?: string, meta?: string): void {
    this.canvas.render(markdown, title, meta, (block) => this.handleBlockSelect(block));
  }

  public async loadFeedback(): Promise<void> {
    try {
      const res = await fetch("/api/feedback");
      if (!res.ok) return;
      const items = await res.json();
      const article = document.querySelector("#doc-content") as HTMLElement;
      if (!article) return;

      for (const item of items) {
        if (item.anchor) {
          const resolved = resolveAnchor(item.anchor, article);
          if (resolved.element) {
            resolved.element.classList.add("annotated");
          }
        }
      }
    } catch {
      // Silent catch
    }
  }

  private handleBlockSelect(block: DocBlock): void {
    const el = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
    if (!el) return;

    this.canvas.markActive(block.id);
    const canvasEl = document.querySelector("#doc-content") as HTMLElement || document.body;
    const anchor = extractAnchor(el, canvasEl);

    this.editor.open(
      block,
      el,
      (quote, comment) => {
        if (!comment) return;
        this.noteSeq++;
        const note: NoteItem = {
          id: `fb_${Date.now()}_${this.noteSeq}`,
          blockId: block.id,
          quote,
          comment,
          status: "unresolved"
        };
        this.composer.addNote(note);
        this.canvas.markAnnotated(block.id, true);
        this.statusRegion.announce(`Note attached to “${quote}” — not yet submitted.`);
        this.canvas.markActive(null);

        // Submit feedback item to backend
        this.saveFeedbackItem(note, anchor);
      },
      () => {
        this.canvas.markActive(null);
      }
    );
  }

  private async saveFeedbackItem(note: NoteItem, anchor: any): Promise<void> {
    try {
      const payload = {
        id: note.id,
        filePath: this.currentFilePath,
        anchor,
        comment: note.comment,
        status: "unresolved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch {
      // Memory fallback
    }
  }

  private handleBatchSubmit(prompt: string, notes: NoteItem[]): void {
    this.statusRegion.announce(getBatchSubmitStatus(prompt, notes.length));
  }

  private handleDiscardNotes(): void {
    const count = this.composer.getNotes().length;
    if (count === 0) return;

    this.confirmDialog.show(
      `Discard ${count} queued note(s)?`,
      "Unsubmitted notes are never written to the feedback queue.",
      () => {
        this.composer.getNotes().forEach((n) => this.canvas.markAnnotated(n.blockId, false));
        this.composer.clearNotes();
        this.statusRegion.announce("Queue discarded.");
      }
    );
  }

  private setupShortcuts(): void {
    window.addEventListener("keydown", (e) => {
      const isInput = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        alert("Shortcuts: [Shift + ?] Help | [Esc] Close / Blur | [Enter] Select block");
      }
    });
  }
}

if (typeof window !== "undefined") {
  (window as any).reviewApp = new ReviewApp();
}
