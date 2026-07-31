import { ThemeToggle } from "./components/ThemeToggle.js";
import { StatusRegion } from "./components/StatusRegion.js";
import { DocCanvas, DocBlock } from "./components/DocCanvas.js";
import { FloatingComposer, NoteItem } from "./components/FloatingComposer.js";
import { AnnotationEditor } from "./components/AnnotationEditor.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";

export class ReviewApp {
  private themeToggle: ThemeToggle;
  private statusRegion: StatusRegion;
  private canvas: DocCanvas;
  private composer: FloatingComposer;
  private editor: AnnotationEditor;
  private confirmDialog: ConfirmDialog;
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

    this.setupShortcuts();
    this.statusRegion.announce("Select any paragraph to attach a review note.");
  }

  public loadMarkdown(markdown: string, title?: string): void {
    this.canvas.render(markdown, title, (block) => this.handleBlockSelect(block));
  }

  private handleBlockSelect(block: DocBlock): void {
    const el = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
    if (!el) return;

    this.canvas.markActive(block.id);

    this.editor.open(
      block,
      el,
      (quote, comment) => {
        if (!comment) return;
        this.noteSeq++;
        const note: NoteItem = {
          id: `n${this.noteSeq}`,
          blockId: block.id,
          quote,
          comment,
          status: "unresolved"
        };
        this.composer.addNote(note);
        this.canvas.markAnnotated(block.id, true);
        this.statusRegion.announce(`Note attached to “${quote}” — not yet submitted.`);
        this.canvas.markActive(null);
      },
      () => {
        this.canvas.markActive(null);
      }
    );
  }

  private handleBatchSubmit(prompt: string, notes: NoteItem[]): void {
    const count = notes.length;
    this.statusRegion.announce(`${count} note(s) + instruction prepared for atomic submission.`);
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
      const isInput = /^(INPUT|TEXTAREA)$/.test((document.activeElement?.tagName || ""));
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        alert("Shortcuts: [Shift + ?] Help | [Esc] Close / Blur | [Enter] Select block");
      }
    });
  }
}

// Auto-initialize app if in browser window
if (typeof window !== "undefined") {
  (window as any).reviewApp = new ReviewApp();
}
