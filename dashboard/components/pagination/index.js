class PaginationComponent extends HTMLElement {
  constructor() {
    super();
    this.currentPage = 1;
    this.totalPages = 1;
    this.maxVisibleButtons = 5;
    this.onPageChange = () => {};
  }

  static get observedAttributes() {
    return ['current-page', 'total-pages', 'max-visible-buttons'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'current-page') {
      this.currentPage = parseInt(newValue) || 1;
    } else if (name === 'total-pages') {
      this.totalPages = parseInt(newValue) || 1;
    } else if (name === 'max-visible-buttons') {
      this.maxVisibleButtons = parseInt(newValue) || 5;
    }

    this.render();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="pagination-container">
        <button class="pagination-button pagination-first" ${this.currentPage === 1 ? 'disabled' : ''}>
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button class="pagination-button pagination-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
          <i class="fas fa-angle-left"></i>
        </button>
        
        ${this.renderPageButtons()}
        
        <button class="pagination-button pagination-next" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
          <i class="fas fa-angle-right"></i>
        </button>
        <button class="pagination-button pagination-last" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    `;
  }

  renderPageButtons() {
    let buttons = '';
    const { startPage, endPage } = this.calculateVisibleRange();

    if (startPage > 1) {
      buttons += `<button class="pagination-button">1</button>`;
      if (startPage > 2) {
        buttons += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons += `
        <button class="pagination-button ${this.currentPage === i ? 'active' : ''}">
          ${i}
        </button>
      `;
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        buttons += `<span class="pagination-ellipsis">...</span>`;
      }
      buttons += `<button class="pagination-button">${this.totalPages}</button>`;
    }

    return buttons;
  }

  calculateVisibleRange() {
    let startPage, endPage;

    if (this.totalPages <= this.maxVisibleButtons) {
      startPage = 1;
      endPage = this.totalPages;
    } else {
      const maxButtonsBeforeCurrent = Math.floor(this.maxVisibleButtons / 2);
      const maxButtonsAfterCurrent = Math.ceil(this.maxVisibleButtons / 2) - 1;

      if (this.currentPage <= maxButtonsBeforeCurrent) {
        startPage = 1;
        endPage = this.maxVisibleButtons;
      } else if (this.currentPage + maxButtonsAfterCurrent >= this.totalPages) {
        startPage = this.totalPages - this.maxVisibleButtons + 1;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - maxButtonsBeforeCurrent;
        endPage = this.currentPage + maxButtonsAfterCurrent;
      }
    }

    return { startPage, endPage };
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (e.target.closest('.pagination-button')) {
        const button = e.target.closest('.pagination-button');

        if (button.classList.contains('pagination-first')) {
          this.changePage(1);
        } else if (button.classList.contains('pagination-prev')) {
          this.changePage(this.currentPage - 1);
        } else if (button.classList.contains('pagination-next')) {
          this.changePage(this.currentPage + 1);
        } else if (button.classList.contains('pagination-last')) {
          this.changePage(this.totalPages);
        } else if (button.textContent && !isNaN(button.textContent)) {
          this.changePage(parseInt(button.textContent));
        }
      }
    });
  }

  changePage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this.setAttribute('current-page', page);

    this.dispatchEvent(
      new CustomEvent('page-change', {
        detail: { currentPage: this.currentPage },
        bubbles: true,
      })
    );

    if (typeof this.onPageChange === 'function') {
      this.onPageChange(this.currentPage);
    }
  }
}

customElements.define('pagination-component', PaginationComponent);
