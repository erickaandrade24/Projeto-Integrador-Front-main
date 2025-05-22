document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');

  // Endpoint que receberá os dados de login (substitua pelo endpoint real posteriormente)
  const apiUrl = 'http://localhost:3000/api/auth/login';

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;

    if (!email || !password) {
      showMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }

    try {
      showMessage('Autenticando...', 'info');

      const loginData = {
        email: email,
        password: password,
        remember: rememberMe,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Login bem-sucedido! Redirecionando...', 'success');

        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userName', data.user.nome);
          localStorage.setItem('userRole', data.user.perfil);
        }

        setTimeout(() => {
          window.location.href = '/dashboard/pages/chamados/index.html';
        }, 1000);
      } else {
        showMessage(
          data.message || 'Credenciais inválidas. Tente novamente.',
          'error'
        );
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      showMessage(
        'Erro ao conectar com o servidor. Tente novamente mais tarde.',
        'error'
      );
    }
  });

  function showMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = 'login-message';

    if (type) {
      loginMessage.classList.add(type);
    }
  }

  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    document.addEventListener('keydown', function (event) {
      if (event.key === 'F2') {
        showMessage(
          'Modo de teste: Login simulado com sucesso! Redirecionando...',
          'success'
        );
        setTimeout(() => {
          window.location.href = '/dashboard/pages/chamados/index.html';
        }, 1000);
      }
    });
  }
});
