class ClientTableComponent extends HTMLElement {
  constructor() {
    super();
    this.clients = []; // Will be loaded from the database
    this.unidades = [
      { id: 'UN001', nome: 'Minas Gerais' },
      { id: 'UN002', nome: 'São Paulo' },
      { id: 'UN003', nome: 'Bahia' },
      { id: 'UN004', nome: 'Rio de Janeiro' },
      { id: 'UN005', nome: 'Pernambuco' },
      { id: 'UN006', nome: 'Praia Grande' },
      { id: 'UN007', nome: 'Santa Catarina' },
      { id: 'UN008', nome: 'Guarujá' },
    ];

    this.modalMode = 'create';
    this.currentClientId = null;
  }

  async connectedCallback() {
    await this.loadClients();
    this.render();
    this.setupEventListeners();
  }

  async loadClients() {
    try {
      const response = await fetch('http://localhost:3000/api/clientes');
      if (!response.ok) throw new Error('Failed to load clients');
      this.clients = await response.json();
      this.render();
    } catch (error) {
      console.error('Error loading clients:', error);
      // Fallback to empty array if API fails
      this.clients = [];
    }
  }

  createModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.id = 'clientModal';

    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Novo Cliente</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="clientForm">
            <div class="form-group">
              <label for="clientName">Nome</label>
              <input type="text" id="clientName" name="nome" placeholder="Nome do cliente" required>
            </div>
            
            <div class="form-group">
              <label for="clientEmail">Email</label>
              <input type="email" id="clientEmail" name="email" placeholder="Email do cliente" required>
            </div>
            
            <div class="form-group">
              <label for="clientCompany">Empresa</label>
              <input type="text" id="clientCompany" name="empresa" placeholder="Nome da empresa">
            </div>
            
            <div class="form-group">
              <label for="clientPhone">Telefone</label>
              <input type="tel" id="clientPhone" name="telefone" placeholder="Telefone do cliente">
            </div>
            
            <div class="form-group">
              <label for="clientLocation">Unidade</label>
              <select id="clientLocation" name="unidade" required>
                <option value="">Selecione uma unidade</option>
                ${this.unidades
                  .map(
                    (unidade) => `
                  <option value="${unidade.id}">${unidade.id} - ${unidade.nome}</option>
                `
                  )
                  .join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label for="clientStatus">Status</label>
              <select id="clientStatus" name="status" required>
                <option value="open">Aberto</option>
                <option value="in_progress">Em atendimento</option>
                <option value="closed">Fechado</option>
              </select>
            </div>

            <div class="form-group">
              <label for="clientDescription">Descrição</label>
              <textarea id="clientDescription" name="descricao" placeholder="Descrição do cliente"></textarea>
            </div>

            <div class="form-group">
              <label for="clientObservations">Observações</label>
              <textarea id="clientObservations" name="observacoes" placeholder="Observações do cliente"></textarea> 
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="modal-cancel">Cancelar</button>
          <button class="modal-save">Salvar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  openModal(mode, clientData = null) {
    this.modalMode = mode;
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    const modalTitle = modal.querySelector('.modal-title');

    if (mode === 'create') {
      modalTitle.textContent = 'Novo Cliente';
      form.reset();
    } else if (mode === 'edit') {
      modalTitle.textContent = 'Editar Cliente';
      this.currentClientId = clientData.id;

      document.getElementById('clientName').value = clientData.nome;
      document.getElementById('clientEmail').value = clientData.email;
      document.getElementById('clientCompany').value = clientData.empresa || '';
      document.getElementById('clientPhone').value = clientData.telefone || '';
      document.getElementById('clientLocation').value =
        clientData.unidade || '';
      document.getElementById('clientStatus').value =
        clientData.status || 'open';
      document.getElementById('clientDescription').value =
        clientData.descricao || '';
      document.getElementById('clientObservations').value =
        clientData.observacoes || '';
    }

    modal.classList.add('open');
  }

  closeModal() {
    const modal = document.getElementById('clientModal');
    modal.classList.remove('open');
  }

  async saveClient() {
    const form = document.getElementById('clientForm');
    const formData = new FormData(form);

    const clientData = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      empresa: formData.get('empresa'),
      telefone: formData.get('telefone'),
      unidade: formData.get('unidade'),
      status: formData.get('status'),
      descricao: formData.get('descricao'),
      mensagem: formData.get('observacoes'),
    };

    try {
      let response;
      if (this.modalMode === 'create') {
        response = await fetch('http://localhost:3000/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });
      } else {
        response = await fetch(
          `http://localhost:3000/api/clientes/${this.currentClientId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData),
          }
        );
      }

      if (!response.ok) throw new Error('Failed to save client');

      this.closeModal();
      await this.loadClients();

      const event = new CustomEvent('client-updated', {
        detail: {
          mode: this.modalMode,
          data: clientData,
        },
        bubbles: true,
      });
      this.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Erro ao salvar cliente. Por favor, tente novamente.');
    }
  }

  getStatusClass(status) {
    switch (status) {
      case 'in_progress':
        return 'status-attending';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-open';
    }
  }

  getStatusText(status) {
    switch (status) {
      case 'in_progress':
        return 'Em atendimento';
      case 'closed':
        return 'Fechado';
      default:
        return 'Aberto';
    }
  }

  render() {
    this.innerHTML = `
      <div class="table-header">
        <h2 class="table-title">Lista de clientes</h2>
        <button class="new-client-button">
          <i class="fas fa-plus"></i>
          Novo Cliente
        </button>
      </div>
      <table class="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Empresa</th>
            <th>Unidade</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${this.clients
            .map(
              (client) => `
            <tr>
              <td>${client.id}</td>
              <td>${client.nome}</td>
              <td>${client.email}</td>
              <td>${client.empresa || '-'}</td>
              <td>${client.unidade || '-'}</td>
              <td>
                <span class="status-badge ${this.getStatusClass(client.status)}">
                  <span class="status-dot"></span>
                  ${this.getStatusText(client.status)}
                </span>
              </td>
              <td>
                <button class="edit-button" data-id="${client.id}">
                  <i class="fas fa-pencil"></i>
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>

      </table>
    `;

    if (!document.getElementById('clientModal')) {
      this.createModal();
    }
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (e.target.closest('.new-client-button')) {
        this.openModal('create');
      } else if (e.target.closest('.edit-button')) {
        const button = e.target.closest('.edit-button');
        const clientId = button.dataset.id;
        const client = this.clients.find((c) => c.id == clientId);
        if (client) {
          this.openModal('edit', client);
        }
      }
    });

    const modal = document.getElementById('clientModal');
    if (modal) {
      const closeButton = modal.querySelector('.modal-close');
      const cancelButton = modal.querySelector('.modal-cancel');
      const saveButton = modal.querySelector('.modal-save');
      const backdrop = modal.querySelector('.modal-backdrop');

      const closeModal = () => this.closeModal();

      closeButton.addEventListener('click', closeModal);
      cancelButton.addEventListener('click', closeModal);
      backdrop.addEventListener('click', closeModal);
      saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveClient();
      });
    }
  }
}

customElements.define('client-table-component', ClientTableComponent);
