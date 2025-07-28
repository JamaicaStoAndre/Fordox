document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const senha = document.querySelector('input[type="password"]').value;

  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password: senha })
  });

  const data = await response.json();

  if (data.success && data.access_token) {
    // Salvar token no localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('perfil', JSON.stringify(data.perfil));
    
    // Redirecionar para dashboard
    window.location.href = 'dashboard_admin.html';
  } else {
    alert('Login inválido. Verifique suas credenciais.');
  }
});
