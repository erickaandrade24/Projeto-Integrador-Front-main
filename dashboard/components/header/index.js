class HeaderComponent extends HTMLElement {
  static observedAttributes = ['page-title'];

  connectedCallback() {
    const pageTitle = this.getAttribute('page-title') || 'Página';
    this.render(pageTitle);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'page-title' && oldValue !== newValue) {
      const titleElement = this.querySelector('.page-title');
      if (titleElement) {
        titleElement.textContent = newValue;
      } else {
        this.render(newValue);
      }
    }
  }

  render(pageTitle) {
    this.innerHTML = `
            <header class="main-header">
                <div class="header-left">
                    <h1 class="page-title">${pageTitle}</h1>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <div class="user-name">Maria Julia</div>
                        <div class="user-role">Recepção</div>
                    </div>
                    <div class="avatar">MJ</div>
                </div>
            </header>
        `;
  }
}

customElements.define('header-component', HeaderComponent);
