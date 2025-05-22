function updatePageTitle(title) {
  const headerComponent = document.querySelector('header-component');
  if (headerComponent) {
    headerComponent.setAttribute('page-title', title);
    document.title = title + ' | Projeto integrador';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const currentSection = document.querySelector('section').id;

  const titleMap = {
    chamados: 'Chamados',
    histórico: 'Histórico',
    clientes: 'Clientes',
  };

  const pageTitle = titleMap[currentSection] || 'Página';
  updatePageTitle(pageTitle);
});

// Create pagination
const pagination = document.createElement('pagination-component');
pagination.setAttribute('current-page', '1');
pagination.setAttribute('total-pages', '15');
document.body.appendChild(pagination);

pagination.addEventListener('page-change', (e) => {
  console.log('Page changed to:', e.detail.currentPage);
});

pagination.onPageChange = (page) => {
  console.log('Page changed to:', page);
};
