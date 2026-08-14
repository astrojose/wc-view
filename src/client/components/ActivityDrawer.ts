/**
 * Activity & Agent Dialogue Drawer component.
 */
export interface BatchActivity {
  id: string;
  filePath: string;
  status: string;
  prompt: string;
  notes: Array<{ id: string; comment: string; quote?: string; status?: string }>;
  replies?: Array<{ id: string; sender: "agent" | "human"; message: string; createdAt: string }>;
  createdAt: string;
}

export class ActivityDrawer {
  private container: HTMLElement;
  private batches: BatchActivity[] = [];
  private isOpen: boolean = false;
  private unreadCount: number = 0;
  private onUnreadChange?: (count: number) => void;

  constructor(onUnreadChange?: (count: number) => void) {
    this.onUnreadChange = onUnreadChange;
    let existing = document.getElementById("activity-drawer-container");
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "activity-drawer-container";
      document.body.appendChild(existing);
    }
    this.container = existing;
    this.render();
  }

  public setBatches(batches: BatchActivity[]): void {
    this.batches = [...batches].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    this.renderActivityList();
  }

  public addReply(batchId: string, reply: { id: string; sender: "agent" | "human"; message: string; createdAt: string }): void {
    const batch = this.batches.find((b) => b.id === batchId);
    if (batch) {
      if (!batch.replies) batch.replies = [];
      if (!batch.replies.some((r) => r.id === reply.id)) {
        batch.replies.push(reply);
        if (!this.isOpen && reply.sender === "agent") {
          this.unreadCount++;
          this.onUnreadChange?.(this.unreadCount);
        }
        this.renderActivityList();
      }
    }
  }

  public show(): void {
    this.isOpen = true;
    this.unreadCount = 0;
    this.onUnreadChange?.(0);
    const drawer = this.container.querySelector(".activity-drawer");
    const backdrop = this.container.querySelector(".drawer-backdrop");
    drawer?.classList.add("visible");
    backdrop?.classList.add("visible");
  }

  public hide(): void {
    this.isOpen = false;
    const drawer = this.container.querySelector(".activity-drawer");
    const backdrop = this.container.querySelector(".drawer-backdrop");
    drawer?.classList.remove("visible");
    backdrop?.classList.remove("visible");
  }

  public toggle(): void {
    if (this.isOpen) this.hide();
    else this.show();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="drawer-backdrop" aria-hidden="true"></div>
      <aside class="activity-drawer" role="complementary" aria-label="Activity & Agent Conversation">
        <div class="drawer-header">
          <div class="drawer-title-group">
            <h3>Review Activity</h3>
            <span class="drawer-status-chip">Live Feed</span>
          </div>
          <button class="drawer-close-btn" aria-label="Close activity drawer">&times;</button>
        </div>
        <div class="drawer-body">
          <div class="activity-thread-list"></div>
        </div>
      </aside>
    `;

    const closeBtn = this.container.querySelector(".drawer-close-btn");
    closeBtn?.addEventListener("click", () => this.hide());

    const backdrop = this.container.querySelector(".drawer-backdrop");
    backdrop?.addEventListener("click", () => this.hide());
  }

  private renderActivityList(): void {
    const listEl = this.container.querySelector(".activity-thread-list");
    if (!listEl) return;

    if (this.batches.length === 0) {
      listEl.innerHTML = `
        <div class="drawer-empty">
          <p>No review activity yet.</p>
          <small>Select text or submit notes in the composer to start agent work.</small>
        </div>
      `;
      return;
    }

    listEl.innerHTML = "";
    this.batches.forEach((batch) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      const time = new Date(batch.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const statusBadge = `<span class="activity-status status-${batch.status}">${batch.status}</span>`;

      let notesHtml = "";
      if (batch.notes && batch.notes.length > 0) {
        notesHtml = `
          <div class="activity-notes">
            ${batch.notes.map((n) => `
              <div class="activity-note-item">
                ${n.quote ? `<blockquote>&ldquo;${escapeHtml(n.quote)}&rdquo;</blockquote>` : ""}
                <p>${escapeHtml(n.comment)}</p>
              </div>
            `).join("")}
          </div>
        `;
      }

      let repliesHtml = "";
      if (batch.replies && batch.replies.length > 0) {
        repliesHtml = `
          <div class="activity-replies">
            ${batch.replies.map((r) => `
              <div class="activity-reply-bubble ${r.sender === "agent" ? "reply-agent" : "reply-human"}">
                <span class="reply-author">${r.sender === "agent" ? "🤖 Agent Response" : "👤 Human"}</span>
                <p>${escapeHtml(r.message)}</p>
              </div>
            `).join("")}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="activity-card-header">
          <span class="activity-batch-id">${escapeHtml(batch.id)}</span>
          ${statusBadge}
        </div>
        ${batch.prompt ? `<p class="activity-prompt"><strong>Prompt:</strong> ${escapeHtml(batch.prompt)}</p>` : ""}
        ${notesHtml}
        ${repliesHtml}
        <div class="activity-card-footer">
          <span class="activity-time">${time}</span>
        </div>
      `;

      listEl.appendChild(card);
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
