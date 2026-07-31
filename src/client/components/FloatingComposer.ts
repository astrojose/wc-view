export interface NoteItem {
  id: string;
  blockId: string;
  quote: string;
  comment: string;
  status: "unresolved" | "in_progress" | "resolved" | "orphaned";
}

/**
 * Floating bottom bar and non-modal composer component.
 */
export class FloatingComposer {
  private container: HTMLElement;
  private chipBadge: HTMLElement;
  private inputElement: HTMLInputElement;
  private notesListElement: HTMLElement;
  private draftPrompt: string = "";
  private notes: NoteItem[] = [];
  private queueOpen = false;
  private onSubmitCallback?: (prompt: string, notes: NoteItem[]) => void;
  private onDiscardCallback?: () => void;
  private invokerElement: HTMLElement | null = null;

  constructor(
    onSubmit?: (prompt: string, notes: NoteItem[]) => void,
    onDiscard?: () => void
  ) {
    this.onSubmitCallback = onSubmit;
    this.onDiscardCallback = onDiscard;

    this.container = document.createElement("footer");
    this.container.className = "floating-composer-container";
    this.container.setAttribute("role", "region");
    this.container.setAttribute("aria-label", "Composer");

    this.container.innerHTML = `
      <div class="floating-composer-bar">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div id="chip-badge" class="chip-badge">🏷️ <span class="chip-count">0</span> notes attached</div>
          <div style="display:flex;gap:var(--space-2)">
            <button id="discard-btn" type="button" class="btn" title="Discard notes">Discard</button>
            <button id="submit-btn" type="button" class="btn btn-primary">Submit Batch</button>
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

    this.bindEvents();
  }

  /** Groups another self-mounting landmark (e.g. StatusRegion) above the composer bar in the sticky bottom region. */
  public mountAbove(element: HTMLElement): void {
    this.container.insertBefore(element, this.container.firstChild);
  }

  public addNote(note: NoteItem): void {
    this.notes.push(note);
    this.renderNotes();
  }

  public removeNote(noteId: string): void {
    this.notes = this.notes.filter((n) => n.id !== noteId);
    this.renderNotes();
  }

  public clearNotes(): void {
    this.notes = [];
    this.renderNotes();
  }

  public getNotes(): NoteItem[] {
    return this.notes;
  }

  public focus(invoker?: HTMLElement): void {
    if (invoker) this.invokerElement = invoker;
    this.inputElement.focus();
  }

  private bindEvents(): void {
    this.inputElement.addEventListener("input", () => {
      this.draftPrompt = this.inputElement.value;
    });

    this.inputElement.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.inputElement.blur();
        if (this.invokerElement) {
          this.invokerElement.focus();
        }
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    const submitBtn = this.container.querySelector("#submit-btn") as HTMLButtonElement;
    submitBtn.addEventListener("click", () => this.handleSubmit());

    const discardBtn = this.container.querySelector("#discard-btn") as HTMLButtonElement;
    discardBtn.addEventListener("click", () => {
      if (this.onDiscardCallback) this.onDiscardCallback();
    });

    const queueToggleBtn = this.container.querySelector("#queue-toggle-btn") as HTMLButtonElement;
    queueToggleBtn.addEventListener("click", () => this.toggleQueue());
  }

  private toggleQueue(): void {
    this.queueOpen = !this.queueOpen;
    const queueToggleBtn = this.container.querySelector("#queue-toggle-btn") as HTMLButtonElement;
    queueToggleBtn.setAttribute("aria-expanded", String(this.queueOpen));
    queueToggleBtn.setAttribute("aria-label", this.queueOpen ? "Hide review queue" : "Show review queue");
    this.notesListElement.classList.toggle("open", this.queueOpen);
  }

  private handleSubmit(): void {
    if (this.onSubmitCallback) {
      this.onSubmitCallback(this.draftPrompt, [...this.notes]);
    }
    this.draftPrompt = "";
    this.inputElement.value = "";
    this.notes = [];
    this.renderNotes();
  }

  private renderNotes(): void {
    const count = this.notes.length;
    this.chipBadge.innerHTML = `🏷️ <span class="chip-count">${count}</span> note${count === 1 ? "" : "s"} attached`;
    this.notesListElement.innerHTML = "";

    this.notes.forEach((n) => {
      const itemEl = document.createElement("div");
      itemEl.className = "queue-item";

      itemEl.innerHTML = `
        <span><strong>“${n.quote}”</strong>: ${n.comment}</span>
        <button type="button" class="btn btn-ghost btn-sm" title="Remove note">×</button>
      `;

      const removeBtn = itemEl.querySelector("button") as HTMLButtonElement;
      removeBtn.addEventListener("click", () => this.removeNote(n.id));

      this.notesListElement.appendChild(itemEl);
    });
  }
}
