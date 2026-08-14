/**
 * Collapsible documentation sidebar component.
 */
export class Sidebar {
  private container: HTMLElement;
  private files: string[] = [];
  private activePath: string = "";
  private isOpen: boolean = true;
  private onSelect?: (filePath: string) => void;

  constructor(onSelect?: (filePath: string) => void) {
    this.onSelect = onSelect;
    let existing = document.getElementById("doc-sidebar-container");
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "doc-sidebar-container";
      document.body.appendChild(existing);
    }
    this.container = existing;
    this.render();
  }

  public setFiles(files: string[], activePath: string): void {
    this.files = files;
    this.activePath = activePath;
    this.renderFileList();
    this.updateVisibility();
  }

  public setActivePath(activePath: string): void {
    this.activePath = activePath;
    this.renderFileList();
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.updateVisibility();
  }

  private updateVisibility(): void {
    const sidebar = this.container.querySelector(".doc-sidebar");
    const toggleBtn = this.container.querySelector(".sidebar-toggle-btn");
    if (!sidebar || !toggleBtn) return;

    if (this.files.length <= 1) {
      sidebar.classList.add("hidden");
      toggleBtn.classList.add("hidden");
      document.body.classList.remove("has-sidebar");
    } else {
      sidebar.classList.remove("hidden");
      toggleBtn.classList.remove("hidden");
      sidebar.classList.toggle("collapsed", !this.isOpen);
      toggleBtn.setAttribute("aria-expanded", String(this.isOpen));
      document.body.classList.toggle("has-sidebar", this.isOpen);
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <button class="sidebar-toggle-btn" aria-label="Toggle document tree" aria-expanded="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <aside class="doc-sidebar" role="navigation" aria-label="Documentation Files">
        <div class="sidebar-header">
          <span class="sidebar-title">Documents</span>
          <span class="sidebar-count">0</span>
        </div>
        <div class="sidebar-search">
          <input type="text" placeholder="Filter files..." class="sidebar-filter-input" aria-label="Filter documentation files" />
        </div>
        <nav class="sidebar-file-list" role="list"></nav>
      </aside>
    `;

    const toggleBtn = this.container.querySelector(".sidebar-toggle-btn");
    toggleBtn?.addEventListener("click", () => this.toggle());

    const filterInput = this.container.querySelector(".sidebar-filter-input") as HTMLInputElement;
    filterInput?.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase();
      this.renderFileList(query);
    });
  }

  private renderFileList(filterQuery: string = ""): void {
    const listEl = this.container.querySelector(".sidebar-file-list");
    const countEl = this.container.querySelector(".sidebar-count");
    if (!listEl) return;

    if (countEl) countEl.textContent = String(this.files.length);

    const filtered = this.files.filter((f) => !filterQuery || f.toLowerCase().includes(filterQuery));

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="sidebar-empty">No files matched</div>`;
      return;
    }

    listEl.innerHTML = "";
    filtered.forEach((file) => {
      const item = document.createElement("button");
      item.className = "sidebar-file-item";
      item.setAttribute("role", "listitem");
      item.title = file;

      const isCurrent = this.activePath.endsWith(file) || file === this.activePath;
      if (isCurrent) item.classList.add("active");

      // Extract filename vs directory prefix
      const parts = file.split("/");
      const fileName = parts.pop() || file;
      const dirPath = parts.join("/");

      item.innerHTML = `
        <span class="file-icon">📄</span>
        <span class="file-info">
          <span class="file-name">${fileName}</span>
          ${dirPath ? `<span class="file-dir">${dirPath}</span>` : ""}
        </span>
      `;

      item.addEventListener("click", () => {
        if (this.onSelect) this.onSelect(file);
      });

      listEl.appendChild(item);
    });
  }
}
