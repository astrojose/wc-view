import { ThemeToggle } from "./components/ThemeToggle.js";
import { StatusRegion } from "./components/StatusRegion.js";
import { DocCanvas, DocBlock } from "./components/DocCanvas.js";
import { FloatingComposer, NoteItem } from "./components/FloatingComposer.js";
import { AnnotationEditor } from "./components/AnnotationEditor.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { HelpDialog } from "./components/HelpDialog.js";
import { Sidebar } from "./components/Sidebar.js";
import { ActivityDrawer, BatchActivity } from "./components/ActivityDrawer.js";
import { DocumentFormat } from "./components/DocCanvas.js";
import { extractAnchor, resolveAnchor } from "./anchoring.js";

import { getBatchSubmitStatus } from "./batchStatus.js";
import "./styles/app.css";

interface BatchView {
  id: string;
  filePath: string;
  status: string;
  prompt: string;
  notes: Array<{ id: string; comment: string; quote?: string; status?: string }>;
  replies?: Array<{ id: string; sender: "agent" | "human"; message: string; createdAt: string }>;
  artifactClass: "scratch" | "protected";
  result?: { summary: string; status: string };
  createdAt: string;
}

interface DocumentPayload {
  path?: string;
  content?: string;
  files?: string[];
  format?: DocumentFormat;
  artifactClass?: "scratch" | "protected";
}

export class ReviewApp {
  private themeToggle: ThemeToggle;
  private statusRegion: StatusRegion;
  private canvas: DocCanvas;
  private composer: FloatingComposer;
  private editor: AnnotationEditor;
  private confirmDialog: ConfirmDialog;
  private helpDialog: HelpDialog;
  private sidebar: Sidebar;
  private activityDrawer: ActivityDrawer;
  private currentFilePath = "";
  private noteSeq = 0;
  private eventSource?: EventSource;
  private batches = new Map<string, BatchView>();
  private refreshedAppliedBatchIds = new Set<string>();

  constructor() {
    this.canvas = new DocCanvas();
    this.themeToggle = new ThemeToggle("dark", true, (theme) => this.canvas.updateTheme(theme));
    this.statusRegion = new StatusRegion();
    this.editor = new AnnotationEditor();
    this.confirmDialog = new ConfirmDialog();
    this.helpDialog = new HelpDialog();
    this.sidebar = new Sidebar((file) => this.loadDocument(file));
    this.activityDrawer = new ActivityDrawer((unread) => this.composer.setUnreadCount(unread));
    this.composer = new FloatingComposer(
      (prompt, notes) => this.handleBatchSubmit(prompt, notes),
      () => this.handleDiscardNotes(),
      (batchId) => this.handleBatchAcceptance(batchId),
      () => this.activityDrawer.toggle()
    );
    this.setupShortcuts();
    this.statusRegion.announce("Select any paragraph to attach a review note.");
    if (typeof window !== "undefined") this.initFromApi();
  }

  public async initFromApi(): Promise<void> {
    try {
      const response = await fetch("/api/document");
      if (!response.ok) return;
      const data = await response.json() as DocumentPayload;
      if (!data.content) return;
      this.currentFilePath = data.path || "";
      this.composer.setTargetPolicy(data.artifactClass || "protected");
      this.sidebar.setFiles(data.files || [], this.currentFilePath);
      this.renderDocument(data.content, data.path ? data.path.split("/").pop() : "Document", undefined, data.format || "markdown");
      await Promise.all([this.loadFeedback(), this.loadBatches()]);
      this.connectEventStream();
    } catch {
      // Standalone mode without backend server API.
    }
  }

  public async loadDocument(relativePath: string): Promise<void> {
    try {
      const response = await fetch(`/api/document?file=${encodeURIComponent(relativePath)}`);
      if (!response.ok) return;
      const data = await response.json() as DocumentPayload;
      if (!data.content) return;
      this.currentFilePath = data.path || "";
      this.composer.setTargetPolicy(data.artifactClass || "protected");
      this.sidebar.setActivePath(this.currentFilePath);
      this.renderDocument(data.content, data.path ? data.path.split("/").pop() : "Document", undefined, data.format || "markdown");
      await Promise.all([this.loadFeedback(), this.loadBatches()]);
      this.statusRegion.announce(`Loaded ${data.path ? data.path.split("/").pop() : "document"}`);
    } catch {
      // Error fetching document
    }
  }

  public loadMarkdown(markdown: string, title?: string, meta?: string): void {
    this.renderDocument(markdown, title, meta, "markdown");
  }

  public renderDocument(content: string, title?: string, meta?: string, format: DocumentFormat = "markdown"): void {
    this.canvas.render(
      content,
      title,
      meta,
      (block) => this.handleBlockSelect(block),
      (label, checked, blockId) => this.handleDecisionToggle(label, checked, blockId),
      format
    );
    this.reapplyAnnotatedNotes();
  }

  private handleDecisionToggle(label: string, checked: boolean, blockId: string): void {
    this.noteSeq++;
    const stateText = checked ? "[x] Approved" : "[ ] Unchecked";
    const comment = `Decision choice: ${stateText} for "${label}"`;
    this.composer.addNote({
      id: `decision_${Date.now()}_${this.noteSeq}`,
      blockId,
      quote: label,
      comment
    });
    this.canvas.markAnnotated(blockId, true);
    this.statusRegion.announce(`Decision staged: ${stateText}`);
  }

  private reapplyAnnotatedNotes(): void {
    const notes = this.composer.getNotes();
    notes.forEach((n) => this.canvas.markAnnotated(n.blockId, true));
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
    this.eventSource.addEventListener("document_change", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as DocumentPayload;
        if (payload.path === this.currentFilePath && payload.content) {
          this.loadMarkdown(payload.content, payload.path.split("/").pop());
          this.statusRegion.announce("Document updated live.");
        }
        if (payload.files) {
          this.sidebar.setFiles(payload.files, this.currentFilePath);
        }
      } catch {}
    });
  }

  private applyBatches(batches: BatchView[], replace: boolean = false): void {
    if (replace) this.batches.clear();
    for (const batch of batches) this.batches.set(batch.id, batch);
    const allBatches = [...this.batches.values()];
    this.activityDrawer.setBatches(allBatches as BatchActivity[]);

    const latest = allBatches.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1);
    if (!latest) return;
    this.composer.setTargetPolicy(latest.artifactClass);
    const message = latest.result?.summary
      ? `${latest.status}: ${latest.result.summary}`
      : `Agent work ${latest.status}.`;
    this.composer.setBatchStatus(message);
    this.composer.setAcceptAction(latest.status === "awaiting_acceptance" ? latest.id : undefined);
    this.statusRegion.announce(message);
    for (const batch of batches) {
      if (this.shouldRefreshDocumentForBatch(batch)) {
        this.refreshedAppliedBatchIds.add(batch.id);
        void this.refreshDocumentFromServer();
      }
    }
  }

  private shouldRefreshDocumentForBatch(batch: BatchView): boolean {
    if (batch.status !== "applied") return false;
    if (this.refreshedAppliedBatchIds.has(batch.id)) return false;
    return !batch.filePath || !this.currentFilePath || batch.filePath === this.currentFilePath;
  }

  private async refreshDocumentFromServer(): Promise<void> {
    try {
      const response = await fetch("/api/document");
      if (!response.ok) return;
      const data = await response.json() as DocumentPayload;
      if (!data.content) return;
      this.currentFilePath = data.path || this.currentFilePath;
      this.composer.setTargetPolicy(data.artifactClass || "protected");
      this.renderDocument(data.content, data.path ? data.path.split("/").pop() : "Document", undefined, data.format || "markdown");
      await this.loadFeedback();

      this.statusRegion.announce("Document refreshed with the latest agent-applied changes.");
    } catch {
      // The streamed batch result remains visible even if a transient refresh fails.
    }
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
        this.helpDialog.toggle();
      }
    });
  }
}

if (typeof window !== "undefined") (window as unknown as { reviewApp: ReviewApp }).reviewApp = new ReviewApp();


