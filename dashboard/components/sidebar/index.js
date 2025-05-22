class Sidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <nav id="sidebar">
                <div id="sidebar_content">
                    <ul id="side_itens">
                        <li class="side-iten">
                            <a href="/dashboard/pages/chamados/index.html">
                                <i class="fa-solid fa-chart-bar"></i>
                                <span class="item-descricao">Chamados</span>
                            </a>
                        </li>
                        <li class="side-iten">
                            <a href="/dashboard/pages/clientes/index.html">
                                <i class="fa-solid fa-user"></i>
                                <span class="item-descricao">Clientes</span>
                            </a>
                        </li>
                        <li class="side-iten">
                            <a href="/dashboard/pages/historico/index.html">
                                <i class="fa-solid fa-clock"></i>
                                <span class="item-descricao">Histórico</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div id="logout">
                    <button id="logout_uni">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span class="item-descricao">Sair</span>
                    </button>
                </div>
            </nav>
        `;

    const sidebar = this.querySelector('#sidebar');

    sidebar.addEventListener('mouseenter', () => {
      sidebar.classList.add('open-sidebar');
    });

    sidebar.addEventListener('mouseleave', () => {
      sidebar.classList.remove('open-sidebar');
    });

    this.setActiveMenuItem();

    const logoutButton = this.querySelector('#logout_uni');

    logoutButton.addEventListener('click', () => {
      this.logout();
    });
  }

  setActiveMenuItem() {
    const items = this.querySelectorAll('.side-iten');

    items.forEach((item) => {
      const link = item.querySelector('a');
      if (link && link.href === window.location.href) {
        item.classList.add('active');
      }
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/dashboard/index.html';
  }
}

customElements.define('sidebar-component', Sidebar);
