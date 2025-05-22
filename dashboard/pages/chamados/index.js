class KanbanApp {
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
      this.checkAndLoadData();
    this.currentStatusFilter = 'all';
  }

   
    checkAndLoadData() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.loadData();
    } else {
      console.log('Token não encontrado. Redirecionando para login (se necessário).');
      // Se o usuário não estiver logado, você pode redirecioná-lo para a página de login aqui
      // window.location.href = '/login.html';
      this.showError('Você precisa estar logado para ver os chamados.');
    }
  }

  initializeElements() {
    
  }

  setupEventListeners() {
  
  }

  async loadData(status = 'all') {
  
  }
  

  initializeElements() {
    // Modal elements
    this.modal = document.getElementById('cardModal');
    this.cardForm = document.getElementById('cardForm');
    this.closeBtn = document.querySelector('.close-modal');
    this.addCardBtn = document.getElementById('addCardBtn');

    // Form fields
    this.cardTitleInput = document.getElementById('cardTitle');
    this.cardDescriptionInput = document.getElementById('cardDescription');
    this.cardMessageInput = document.getElementById('cardMessage');
    this.cardPriorityInput = document.getElementById('cardPriority');
    this.cardAssigneeInput = document.getElementById('cardAssignee');
    this.cardClientInput = document.getElementById('cardClient');
    this.cardDeadlineInput = document.getElementById('cardDeadline');
    this.cardStatusInput = document.getElementById('cardStatus');

    // UI elements
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'loading-indicator';
    this.loadingIndicator.textContent = 'Carregando...';
    document.body.appendChild(this.loadingIndicator);

    // State management
    this.editingCardId = null;
    this.columns = document.querySelectorAll('kanban-column');
    this.searchInput = document.getElementById('searchInput');
    this.searchBtn = document.getElementById('searchBtn');
  }

  setupEventListeners() {
    this.addCardBtn.addEventListener('click', () => this.openModal());
    this.closeBtn.addEventListener('click', () => this.closeModal());
    this.cardForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    document.addEventListener('edit-card', (e) =>
      this.handleEditCard(e.detail)
    );
    document.addEventListener('card-status-changed', (e) =>
      this.handleStatusChange(e.detail)
    );

    this.searchBtn.addEventListener('click', () => this.handleSearch());
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Refresh button (TODO: Implement this in the html)
    document
      .getElementById('refreshBtn')
      ?.addEventListener('click', () => this.loadData());
  }

  async loadData(status = 'all') {
    this.showLoading();
    this.currentStatusFilter = status;

    try {
      const url =
        status === 'all'
          ? 'http://localhost:3000/api/chamados'
          : `http://localhost:3000/api/chamados?status=${status}`;

         

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.renderCards(data);
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Falha ao carregar dados. Tente novamente.');
    } finally {
      this.hideLoading();
    }
  }

  renderCards(cardsData) {
    this.columns.forEach((column) => {
      const container =
        column.shadowRoot?.querySelector('.column-cards') || column;
      container.innerHTML = '';
    });

    // Group cards by status for better performance
    const cardsByStatus = {};
    cardsData.forEach((cardData) => {
      if (!cardsByStatus[cardData.status]) {
        cardsByStatus[cardData.status] = [];
      }
      cardsByStatus[cardData.status].push(cardData);
    });

    // Add cards to their respective columns
    Object.entries(cardsByStatus).forEach(([status, cards]) => {
      const column = document.querySelector(
        `kanban-column[data-status="${status}"]`
      );
      if (!column) return;

      const container =
        column.shadowRoot?.querySelector('.column-cards') || column;

      cards.forEach((cardData) => {
        const card = this.createCardElement(cardData);
        container.appendChild(card);
      });
    });
  }

  formatForDisplay(isoDate) {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('T')[0].split('-');
    const formattedDate = new Date(year, month - 1, day);
    return formattedDate.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  createCardElement(cardData) {
    const card = document.createElement('task-card');
    card.id = cardData.id;
    card.setAttribute('title', cardData.titulo);
    card.setAttribute('description', cardData.descricao);
    card.setAttribute('message', cardData.mensagem_cliente || '');
    card.setAttribute('priority', cardData.prioridade || 'medium');
    card.setAttribute('assignee', cardData.usuario_nome || '');
    card.setAttribute('status', cardData.status);
    card.setAttribute('created-at', cardData.created_at);
    card.setAttribute('deadline', this.formatForDisplay(cardData.prazo) || '');
    card.setAttribute('client', cardData.cliente_nome || '');
    card.setAttribute('clientId', cardData.cliente_id || '');

    return card;
  }

  async handleSearch() {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) return;

    this.showLoading();

    try {
      const response = await fetch(
        `http://localhost:3000/api/chamados/search?q=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      this.renderCards(results);
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Falha na busca. Tente novamente.');
    } finally {
      this.hideLoading();
    }
  }

  async createCard(cardData) {
    this.showLoading();

    try {
      const response = await fetch('http://localhost:3000/api/chamados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          titulo: cardData.title,
          descricao: cardData.description,
          mensagem_cliente: cardData.message || '',
          prioridade: cardData.priority,
          status: cardData.status,
          prazo: cardData.deadline || null,
          usuario_id: localStorage.getItem('userId'), // TODO: replace to dynamic user ID after auth were implemented
          cliente_id: cardData.clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard = await response.json();
      this.addCardToColumn(newCard);
    } catch (error) {
      console.error('Error creating card:', error);
      this.showError('Falha ao criar chamado.');
    } finally {
      this.hideLoading();
    }
  }

  async updateCard(id, cardData) {
    this.showLoading();

    try {
      const requestData = {
        titulo: cardData.title ?? null,
        descricao: cardData.description ?? null,
        mensagem_cliente: cardData.message ?? null,
        prioridade: cardData.priority ?? 'medium',
        status: cardData.status ?? null,
        prazo: cardData.deadline,
      };

      const response = await fetch(`http://localhost:3000/api/chamados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update card');
      }

      this.loadData(this.currentStatusFilter);
      this.showSuccess('Chamado atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating card:', error);
      this.showError(error.message || 'Falha ao atualizar chamado.');
    } finally {
      this.hideLoading();
    }
  }

  async handleStatusChange({ cardId, newStatus }) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chamados/${cardId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      this.loadData(this.currentStatusFilter);
    } catch (error) {
      console.error('Error updating status:', error);
      this.showError('Falha ao atualizar status.');
    }
  }

  // UI Helper Methods
  showLoading() {
    this.loadingIndicator.style.display = 'block';
  }

  hideLoading() {
    this.loadingIndicator.style.display = 'none';
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);

    setTimeout(() => {
      errorElement.remove();
    }, 3000);
  }

  async openModal(cardData = null) {
    // Resetar ou preencher o formulário
    this.cardForm.reset();

    // Se estiver editando um card existente
    if (cardData) {
      this.editingCardId = cardData.cardId;
      this.cardTitleInput.value = cardData.title || '';
      this.cardDescriptionInput.value = cardData.description || '';
      this.cardMessageInput.value = cardData.message || '';
      this.cardPriorityInput.value = cardData.priority || 'medium';
      this.cardStatusInput.value = cardData.status || 'backlog';
      this.cardClientInput.value = cardData.clientId || '';

      if (cardData.deadline) {
        const [day, month, year] = cardData.deadline.split('/');
        this.cardDeadlineInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        this.cardDeadlineInput.value = '';
      }

      // Preenche o campo de cliente
      const clientSelect = document.getElementById('cardClient');
      clientSelect.innerHTML = '';
      const clientOption = document.createElement('option');
      clientOption.value = cardData.clientId;
      clientOption.textContent = cardData.client;
      clientSelect.appendChild(clientOption);

      clientSelect.disabled = true;

      // Preenche o campo de responsável
      const userSelect = document.getElementById('cardAssignee');
      userSelect.innerHTML = '';
      const userOption = document.createElement('option');
      userOption.value = cardData.assigneeId;
      userOption.textContent = cardData.assignee;
      userSelect.appendChild(userOption);

      // Atualiza o título do modal
      document.querySelector('.modal-content h2').textContent =
        'Editar Chamado';
    } else {
      this.editingCardId = null;
      // Atualiza o título do modal
      document.querySelector('.modal-content h2').textContent = 'Novo Chamado';
      const clients = await fetch('http://localhost:3000/api/clientes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const clientsData = await clients.json();
      const clientSelect = document.getElementById('cardClient');
      clientSelect.innerHTML = '';
      clientsData.forEach((client) => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.nome;
        clientSelect.appendChild(option);
      });

      this.cardAssigneeInput.value = '';
      this.cardAssigneeInput.innerHTML = '';
      const users = await fetch('http://localhost:3000/api/usuarios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const usersData = await users.json();
      const userSelect = document.getElementById('cardAssignee');
      userSelect.innerHTML = '';
      usersData.forEach((user) => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.nome;
        userSelect.appendChild(option);
      });
    }

    this.modal.style.display = 'block';
  }

  closeModal() {
    this.modal.style.display = 'none';
    this.editingCardId = null;
  }

  getCardById(id) {
    const card = document.getElementById(id);
    if (!card) {
      console.error(`Card with ID ${id} not found`);
      return null;
    }
    return card;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleDateString('pt-BR', options).replace(/\//g, '-');
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const cardData = {
      title: this.cardTitleInput.value,
      description: this.cardDescriptionInput.value,
      message: this.cardMessageInput.value,
      priority: this.cardPriorityInput.value,
      assignee: this.cardAssigneeInput.value,
      clientId: this.cardClientInput.value,
      deadline: this.cardDeadlineInput.value,
      status: this.cardStatusInput.value,
    };

    if (this.editingCardId) {
      this.updateCard(+this.editingCardId, cardData);
    } else {
      this.createCard(cardData);
    }

    this.closeModal();
  }

  handleEditCard(cardData) {
    this.openModal(cardData);
  }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new KanbanApp();
});
