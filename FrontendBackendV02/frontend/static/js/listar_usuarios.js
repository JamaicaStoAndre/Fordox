// === frontend/static/js/listar_usuarios.js ===

// Função para carregar e exibir os usuários cadastrados
async function carregarUsuarios() {
  const tabela = document.getElementById("tabela-usuarios");
  const mensagem = document.getElementById("mensagem");

  try {
    // Busca o token salvo no navegador
    const session = JSON.parse(localStorage.getItem("supabase.auth.token"));
    const token = session?.currentSession?.access_token;

    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    // Chamada à API para buscar os usuários
    const resposta = await fetch("http://localhost:8000/usuarios/listar", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!resposta.ok) {
      mensagem.innerText = "Erro ao carregar usuários. Acesso negado?";
      mensagem.className = "text-danger";
      return;
    }

    const usuarios = await resposta.json();

    // Preenche a tabela com os usuários retornados
    usuarios.forEach(usuario => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.tipo_usuario}</td>
      `;
      tabela.appendChild(linha);
    });

  } catch (error) {
    console.error("Erro:", error);
    mensagem.innerText = "Erro ao conectar com o servidor.";
    mensagem.className = "text-danger";
  }
}

// Chamada automática ao carregar a página
window.addEventListener("DOMContentLoaded", carregarUsuarios);

// Função de logout
document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/login.html";
});
