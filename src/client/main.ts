import { ThemeToggle } from "./components/ThemeToggle.js";
import { StatusRegion } from "./components/StatusRegion.js";
import { DocCanvas, DocBlock } from "./components/DocCanvas.js";
import { FloatingComposer, NoteItem } from "./components/FloatingComposer.js";
import { AnnotationEditor } from "./components/AnnotationEditor.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { extractAnchor, resolveAnchor } from "./anchoring.js";
import { getBatchSubmitStatus } from "./batchStatus.js";
import "./styles/app.css";

interface BatchView {
  id: string;
  status: string;
  artifactClass: "scratch" | "protected";
  result?: { summary: string; status: string };
  createdAt: string;
}

export class ReviewApp {
  private themeToggle: ThemeToggle;
  private statusRegion: StatusRegion;
  private canvas: DocCanvas;
  private composer: FloatingComposer;
  private editor: AnnotationEditor;
  private confirmDialog: ConfirmDialog;
  private currentFilePath = "";
  private noteSeq = 0;
  private eventSource?: EventSource;
  private batches = new Map<string, BatchView>();

  constructor() {
    this.themeToggle = new ThemeToggle("dark");
    this.statusRegion = new StatusRegion();
    this.canvas = new DocCanvas();
    this.editor = new AnnotationEditor();
    this.confirmDialog = new ConfirmDialog();
    this.composer = new FloatingComposer(
      (prompt, notes) => this.handleBatchSubmit(prompt, notes),
      () => this.handleDiscardNotes(),
      (batchId) => this.handleBatchAcceptance(batchId)
    );
    this.composer.mountAbove(this.statusRegion.getElement());
    this.setupShortcuts();
    this.statusRegion.announce("Select any paragraph to attach a review note.");
    if (typeof window !== "undefined") this.initFromApi();
  }

  public async initFromApi(): Promise<void> {
    try {
      const response = await fetch("/api/document");
      if (!response.ok) return;
      const data = await response.json();
      if (!data.content) return;
      this.currentFilePath = data.path || "";
      this.composer.setTargetPolicy(data.artifactClass || "protected");
      this.loadMarkdown(data.content, data.path ? data.path.split("/").pop() : "Document");
      await Promise.all([this.loadFeedback(), this.loadBatches()]);
      this.connectEventStream();
    } catch {
      // Standalone mode without backend server API.
    }
  }

  public loadMarkdown(markdown: string, title?: string, meta?: string): void {
    this.canvas.render(markdown, title, meta, (block) => this.handleBlockSelect(block));
  }

  public async loadFeedback(): Promise<void> {
    try {
      const response = await fetch("/api/feedback");
      if (!response.ok) return;
      const article = document.querySelector("#doc-content") as HTMLElement;
      if (!article) return;
      for (const item of await response.json()) {
        if (item.anchor && resolveAnchor(item.anchor, article).element) {
          resolveAnchor(item.anchor, article).element?.classList.add("annotated");
        }
      }
    } catch {
      // Legacy annotations do not block batch review.
    }
  }

  private async loadBatches(): Promise<void> {
    try {
      const response = await fetch("/api/batches");
      if (response.ok) this.applyBatches(await response.json(), true);
    } catch {
      // The page remains usable when no bridge endpoint is available.
    }
  }

  private connectEventStream(): void {
    this.eventSource?.close();
    this.eventSource = new EventSource("/api/events");
    this.eventSource.addEventListener("snapshot", (event) => this.applyBatches(JSON.parse((event as MessageEvent).data), true));
    this.eventSource.addEventListener("batch", (event) => this.applyBatches([JSON.parse((event as MessageEvent).data)]));
  }

  private applyBatches(batches: BatchView[], replace: boolean = false): void {
    if (replace) this.batches.clear();
    for (const batch of batches) this.batches.set(batch.id, batch);
    const latest = [...this.batches.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1);
    if (!latest) return;
    this.composer.setTargetPolicy(latest.artifactClass);
    const message = latest.result?.summary
      ? `${latest.status}: ${latest.result.summary}`
      : `Agent work ${latest.status}.`;
    this.composer.setBatchStatus(message);
    this.composer.setAcceptAction(latest.status === "awaiting_acceptance" ? latest.id : undefined);
    this.statusRegion.announce(message);
  }

  private handleBlockSelect(block: DocBlock): void {
    const element = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;
    if (!element) return;
    this.canvas.markActive(block.id);
    const canvasElement = document.querySelector("#doc-content") as HTMLElement || document.body;
    const anchor = extractAnchor(element, canvasElement);
    this.editor.open(
      block,
      element,
      (quote, comment) => {
        if (!comment) return;
        this.noteSeq++;
        this.composer.addNote({
          id: `note_${Date.now()}_${this.noteSeq}`,
          blockId: block.id,
          quote,
          comment,
          anchor
        });
        this.canvas.markAnnotated(block.id, true);
        this.statusRegion.announce(`Note attached to “${quote}” — send the batch to start agent work.`);
        this.canvas.markActive(null);
      },
      () => this.canvas.markActive(null)
    );
  }

  private async handleBatchSubmit(prompt: string, notes: NoteItem[]): Promise<boolean> {
    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `batch_${crypto.randomUUID()}`,
          filePath: this.currentFilePath,
          prompt,
          notes: notes.map(({ id, anchor, comment }) => ({ id, anchor: anchor!, comment }))
        })
      });
      if (!response.ok) throw new Error("The feedback batch could not be saved.");
      const batch = await response.json() as BatchView;
      const message = getBatchSubmitStatus(prompt, notes.length);
      this.composer.setTargetPolicy(batch.artifactClass);
      this.composer.setBatchStatus(`Agent work queued (${batch.id}).`);
      this.statusRegion.announce(message);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "The feedback batch could not be saved.";
      this.composer.setBatchStatus(message);
      this.statusRegion.announce(message);
      return false;
    }
  }

  private async handleBatchAcceptance(batchId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/batches/${encodeURIComponent(batchId)}/accept`, { method: "POST" });
      if (!response.ok) throw new Error("The feedback batch could not be accepted.");
      const batch = await response.json() as BatchView;
      this.applyBatches([batch]);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "The feedback batch could not be accepted.";
      this.composer.setBatchStatus(message);
      this.statusRegion.announce(message);
      return false;
    }
  }

  private handleDiscardNotes(): void {
    const count = this.composer.getNotes().length;
    if (count === 0) return;
    this.confirmDialog.show(
      `Discard ${count} queued note(s)?`,
      "Unsubmitted notes are never written to the feedback queue.",
      () => {
        this.composer.getNotes().forEach((note) => this.canvas.markAnnotated(note.blockId, false));
        this.composer.clearNotes();
        this.statusRegion.announce("Queue discarded.");
      }
    );
  }

  private setupShortcuts(): void {
    window.addEventListener("keydown", (event) => {
      const isInput = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
      if (event.key === "?" && !isInput) {
        event.preventDefault();
        alert("Shortcuts: [Shift + ?] Help | [Esc] Close / Blur | [Ctrl/Cmd + Enter] Send to Agent");
      }
    });
  }
}

if (typeof window !== "undefined") (window as unknown as { reviewApp: ReviewApp }).reviewApp = new ReviewApp();
