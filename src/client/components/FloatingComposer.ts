import { AnchorData } from "../anchoring.js";

export interface NoteItem {
  id: string;
  blockId: string;
  quote: string;
  comment: string;
  anchor?: AnchorData;
  status?: "unresolved" | "in_progress" | "resolved" | "orphaned";
}

type SubmitResult = boolean | void | Promise<boolean | void>;

export class FloatingComposer {
  private container: HTMLElement;
  private chipBadge: HTMLElement;
  private inputElement: HTMLInputElement;
  private notesListElement: HTMLElement;
  private submitButton: HTMLButtonElement;
  private acceptButton: HTMLButtonElement;
  private draftPrompt = "";
  private notes: NoteItem[] = [];
  private queueOpen = false;
  private submitting = false;
  private onSubmitCallback?: (prompt: string, notes: NoteItem[]) => SubmitResult;
  private onDiscardCallback?: () => void;
  private onAcceptCallback?: (batchId: string) => SubmitResult;
  private onActivityToggleCallback?: () => void;
  private invokerElement: HTMLElement | null = null;

  constructor(
    onSubmit?: (prompt: string, notes: NoteItem[]) => SubmitResult,
    onDiscard?: () => void,
    onAccept?: (batchId: string) => SubmitResult,
    onActivityToggle?: () => void
  ) {
    this.onSubmitCallback = onSubmit;
    this.onDiscardCallback = onDiscard;
    this.onAcceptCallback = onAccept;
    this.onActivityToggleCallback = onActivityToggle;
    this.container = document.createElement("footer");
    this.container.className = "floating-composer-container";
    this.container.setAttribute("role", "region");
    this.container.setAttribute("aria-label", "Composer");
    this.container.innerHTML = `
      <div class="floating-composer-bar">
        <div id="target-policy" class="composer-policy" role="status">Protected project artifact — result requires your acceptance</div>
        <div id="batch-status" class="composer-status" aria-live="polite">Ready for feedback.</div>
        <button id="accept-result-btn" type="button" class="btn btn-primary" hidden>Accept and apply</button>
        <div class="composer-summary-row">
          <div class="composer-badge-group">
            <div id="chip-badge" class="chip-badge">🏷️ <span class="chip-count">0</span> notes attached</div>
            <button id="activity-drawer-btn" type="button" class="btn btn-ghost btn-sm" title="Open Activity & Dialogue Feed">
              💬 Feed <span id="unread-reply-badge" class="unread-badge" hidden>0</span>
            </button>
          </div>
          <div class="composer-actions">
            <button id="discard-btn" type="button" class="btn" title="Discard notes">Discard</button>
            <button id="submit-btn" type="button" class="btn btn-primary">Send to Agent</button>
          </div>
        </div>


        <div id="queued-notes-list" class="composer-queue" role="region" aria-label="Pending annotations"></div>
        <div class="composer-input-row">
          <button id="queue-toggle-btn" type="button" class="icon-btn" aria-expanded="false" aria-label="Show review queue"><span aria-hidden="true">≡</span></button>
          <input id="composer-prompt" type="text" class="composer-input" placeholder="Add an instruction for the agent..." />
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
    this.chipBadge = this.container.querySelector("#chip-badge") as HTMLElement;
    this.inputElement = this.container.querySelector("#composer-prompt") as HTMLInputElement;
    this.notesListElement = this.container.querySelector("#queued-notes-list") as HTMLElement;
    this.submitButton = this.container.querySelector("#submit-btn") as HTMLButtonElement;
    this.acceptButton = this.container.querySelector("#accept-result-btn") as HTMLButtonElement;
    this.bindEvents();
  }


  public mountAbove(element: HTMLElement): void {
    this.container.insertBefore(element, this.container.firstChild);
  }

  public addNote(note: NoteItem): void {
    this.notes.push(note);
    this.renderNotes();
  }

  public removeNote(noteId: string): void {
    this.notes = this.notes.filter((note) => note.id !== noteId);
    this.renderNotes();
  }

  public clearNotes(): void {
    this.notes = [];
    this.renderNotes();
  }

  public getNotes(): NoteItem[] {
    return this.notes;
  }

  public setTargetPolicy(artifactClass: "scratch" | "protected"): void {
    const policy = this.container.querySelector("#target-policy") as HTMLElement;
    policy.textContent = artifactClass === "scratch"
      ? "Scratch artifact — automatic update allowed"
      : "Protected project artifact — result requires your acceptance";
  }

  public setBatchStatus(message: string): void {
    (this.container.querySelector("#batch-status") as HTMLElement).textContent = message;
  }

  public setAcceptAction(batchId?: string): void {
    this.acceptButton.hidden = !batchId;
    this.acceptButton.dataset.batchId = batchId || "";
  }

  public setUnreadCount(count: number): void {
    const badge = this.container.querySelector("#unread-reply-badge") as HTMLElement;
    if (badge) {
      badge.textContent = String(count);
      badge.hidden = count <= 0;
    }
  }

  public focus(invoker?: HTMLElement): void {
    if (invoker) this.invokerElement = invoker;
    this.inputElement.focus();
  }

  private bindEvents(): void {
    this.inputElement.addEventListener("input", () => (this.draftPrompt = this.inputElement.value));
    this.inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.inputElement.blur();
        this.invokerElement?.focus();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        this.handleSubmit();
      }
    });
    this.submitButton.addEventListener("click", () => this.handleSubmit());
    this.acceptButton.addEventListener("click", () => {
      const batchId = this.acceptButton.dataset.batchId;
      if (!batchId || this.submitting) return;
      const outcome = this.onAcceptCallback?.(batchId);
      if (outcome instanceof Promise) {
        this.submitting = true;
        this.acceptButton.disabled = true;
        outcome.finally(() => {
          this.submitting = false;
          this.acceptButton.disabled = false;
        });
      }
    });
    (this.container.querySelector("#discard-btn") as HTMLButtonElement).addEventListener("click", () => this.onDiscardCallback?.());
    (this.container.querySelector("#queue-toggle-btn") as HTMLButtonElement).addEventListener("click", () => this.toggleQueue());
    (this.container.querySelector("#activity-drawer-btn") as HTMLButtonElement)?.addEventListener("click", () => this.onActivityToggleCallback?.());
  }


  private toggleQueue(): void {
    this.queueOpen = !this.queueOpen;
    const toggle = this.container.querySelector("#queue-toggle-btn") as HTMLButtonElement;
    toggle.setAttribute("aria-expanded", String(this.queueOpen));
    toggle.setAttribute("aria-label", this.queueOpen ? "Hide review queue" : "Show review queue");
    this.notesListElement.classList.toggle("open", this.queueOpen);
  }

  private handleSubmit(): void {
    if (this.submitting || (!this.draftPrompt.trim() && this.notes.length === 0)) return;
    const outcome = this.onSubmitCallback?.(this.draftPrompt, [...this.notes]);
    if (outcome instanceof Promise) {
      this.submitting = true;
      this.submitButton.disabled = true;
      this.submitButton.textContent = "Sending…";
      outcome.then((accepted) => {
        if (accepted !== false) this.clearSubmittedDraft();
      }).finally(() => {
        this.submitting = false;
        this.submitButton.disabled = false;
        this.submitButton.textContent = "Send to Agent";
      });
      return;
    }
    if (outcome !== false) this.clearSubmittedDraft();
  }

  private clearSubmittedDraft(): void {
    this.draftPrompt = "";
    this.inputElement.value = "";
    this.clearNotes();
  }

  private renderNotes(): void {
    const count = this.notes.length;
    this.chipBadge.innerHTML = `<span aria-hidden="true">#</span><span class="chip-count">${count}</span> note${count === 1 ? "" : "s"} attached`;
    this.notesListElement.innerHTML = "";
    for (const note of this.notes) {
      const item = document.createElement("div");
      item.className = "queue-item";
      item.innerHTML = `<span><strong>“${note.quote}”</strong>: ${note.comment}</span><button type="button" class="btn btn-ghost btn-sm" title="Remove note">×</button>`;
      (item.querySelector("button") as HTMLButtonElement).addEventListener("click", () => this.removeNote(note.id));
      this.notesListElement.appendChild(item);
    }
  }
}
