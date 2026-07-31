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
          <div id="chip-badge" class="chip-badge">🏷️ 0 notes attached</div>
          <div style="display:flex;gap:var(--space-2)">
            <button id="discard-btn" type="button" class="btn" title="Discard notes">Discard</button>
            <button id="submit-btn" type="button" class="btn btn-primary">Submit Batch</button>
          </div>
        </div>
        <div class="composer-input-row">
          <input id="composer-prompt" type="text" class="composer-input" placeholder="Add an instruction for the agent..." />
        </div>
        <div id="queued-notes-list" style="display:flex;flex-direction:column;gap:var(--space-1);max-height:120px;overflow-y:auto"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.chipBadge = this.container.querySelector("#chip-badge") as HTMLElement;
    this.inputElement = this.container.querySelector("#composer-prompt") as HTMLInputElement;
    this.notesListElement = this.container.querySelector("#queued-notes-list") as HTMLElement;

    this.bindEvents();
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
    this.chipBadge.textContent = `🏷️ ${this.notes.length} note${this.notes.length === 1 ? "" : "s"} attached`;
    this.notesListElement.innerHTML = "";

    this.notes.forEach((n) => {
      const itemEl = document.createElement("div");
      itemEl.style.display = "flex";
      itemEl.style.alignItems = "center";
      itemEl.style.justifyContent = "space-between";
      itemEl.style.fontSize = "var(--type-small-size)";
      itemEl.style.padding = "var(--space-1) var(--space-2)";
      itemEl.style.backgroundColor = "var(--surface-inset)";
      itemEl.style.borderRadius = "var(--radius-sm)";

      itemEl.innerHTML = `
        <span><strong>“${n.quote}”</strong>: ${n.comment}</span>
        <button type="button" class="btn" style="min-height:28px;padding:0 var(--space-2)" title="Remove note">×</button>
      `;

      const removeBtn = itemEl.querySelector("button") as HTMLButtonElement;
      removeBtn.addEventListener("click", () => this.removeNote(n.id));

      this.notesListElement.appendChild(itemEl);
    });
  }
}
