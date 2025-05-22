class HistoricTableComponent extends HTMLElement {
  constructor() {
    super();
    this.historicData = [];
    this.chamadoId = null;
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = 1;
  }

  async connectedCallback() {
    await this.loadHistoric();
    this.render();
  }

  async loadHistoric() {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chamados/historicos?page=${this.currentPage}&pageSize=${this.pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to load historic data');

      const data = await response.json();
      this.historicData = data.items.items;
      this.totalPages = data.totalPages;

      this.render();
    } catch (error) {
      console.error('Error loading historic data:', error);
      this.historicData = [];
      this.render();
    }
  }

  getActionText(action) {
    const actions = {
      create: 'Criação',
      update: 'Atualização',
      status_change: 'Mudança de Status',
      comment: 'Comentário',
    };
    return actions[action] || action;
  }

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  }

  render() {
    this.innerHTML = `
      <div class="historic-table-container">
        <div class="historic-table-header">
          <h2 class="historic-table-title">Histórico do Chamado</h2>
        </div>
        <table class="historic-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Campo Alterado</th>
              <th>Valor Anterior</th>
              <th>Novo Valor</th>
              <th>Comentário</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderTableBody()}
          </tbody>
        </table>
      </div>
      ${this.renderPagination()}
    `;

    this.setupPaginationEvents();
  }

  renderTableBody() {
    if (this.historicData.length === 0) {
      return `
        <tr>
          <td colspan="7" class="historic-no-data">Nenhum histórico encontrado</td>
        </tr>
      `;
    }

    return this.historicData
      .map(
        (item) => `
      <tr>
        <td>${item.usuario_nome}</td>
        <td class="historic-action-${item.acao.split('_').join('-')}">
          ${this.getActionText(item.acao)}
        </td>
        <td>${item.campo_alterado || '-'}</td>
        <td>${item.valor_anterior || '-'}</td>
        <td>${item.novo_valor || '-'}</td>
        <td>${item.comentario || '-'}</td>
        <td>${this.formatDateTime(item.created_at)}</td>
      </tr>
    `
      )
      .join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) return '';

    return `
      <pagination-component
        current-page="${this.currentPage}"
        total-pages="${this.totalPages}"
        class="historic-pagination"
      ></pagination-component>
    `;
  }

  setupPaginationEvents() {
    const pagination = this.querySelector('pagination-component');
    if (pagination) {
      pagination.addEventListener('page-change', (e) => {
        this.currentPage = e.detail.currentPage;
        this.setAttribute('current-page', this.currentPage);
        this.setAttribute('total-pages', this.totalPages);
        this.loadHistoric();
      });
    }
  }
}

customElements.define('historic-table-component', HistoricTableComponent);
