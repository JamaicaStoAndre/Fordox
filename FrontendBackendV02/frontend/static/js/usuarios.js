// === frontend/static/js/usuarios.js ===

/**
 * Script da página usuarios.html
 * ----------------------------------
 * Funções:
 * - Verifica se o usuário está autenticado
 * - Busca e exibe os usuários cadastrados na tabela
 * - Mostra o e-mail do usuário logado no topo
 * - Permite logout (limpa o token e redireciona)
 * 
 * Este script é carregado automaticamente quando a página termina de carregar.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 📌 Pegar o token salvo no navegador (localStorage)
  const token = localStorage.getItem("access_token");

  // 🔒 Se não estiver logado, redireciona para o login
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    // ✅ Buscar o perfil do usuário autenticado para mostrar no topo da página
    const perfilResponse = await fetch("/auth/perfil", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!perfilResponse.ok) {
      throw new Error("Não autorizado");
    }

    const perfilData = await perfilResponse.json();
    const email = perfilData.usuario?.email || "Usuário";

    // Preencher o email do usuário logado no canto superior direito
    document.getElementById("user-email").innerText = email;
  } catch (error) {
    // 🔐 Erro de token → deslogar e redirecionar
    localStorage.removeItem("access_token");
    window.location.href = "/login.html";
    return;
  }

  // 🚀 Buscar os usuários cadastrados na API
  try {
    const usuariosResponse = await fetch("/usuarios/listar", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!usuariosResponse.ok) {
      const erro = await usuariosResponse.json();
      throw new Error(erro.detail || "Erro ao buscar usuários");
    }

    const usuarios = await usuariosResponse.json();

    // Validar resposta
    if (!Array.isArray(usuarios)) {
      throw new Error("Resposta inválida da API");
    }

    // 🧱 Inserir dados na tabela
    const tbody = document.getElementById("tabela-usuarios");
    tbody.innerHTML = ""; // limpa antes de popular

    usuarios.forEach(usuario => {
      const linha = `
        <tr>
          <td>${usuario.nome}</td>
          <td>${usuario.email}</td>
          <td>${usuario.tipo_usuario}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", linha);
    });

  } catch (error) {
    console.error("Erro ao carregar usuários:", error.message);
    // (Opcional) mostrar mensagem de erro para o usuário
  }

  // 🚪 Lógica do botão de logout
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("perfil");
    window.location.href = "/login.html";
  });
});
