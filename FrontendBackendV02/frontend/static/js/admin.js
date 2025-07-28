// === assets/admin.js ===

/**
 * Este script:
 * - Garante que o usuário esteja autenticado com token.
 * - Busca e exibe o e-mail do usuário logado.
 * - Controla a lógica de cadastro de novos usuários.
 * - Mostra mensagem de sucesso ou erro.
 * - Redireciona para listagem após sucesso.
 * - Controla o botão de logout.
 */

// === 1. Alternar o menu lateral (abrir/fechar sidebar) ===
document.getElementById("menu-toggle").addEventListener("click", function () {
  document.getElementById("sidebar-wrapper").classList.toggle("collapsed");
});

// === 2. Aguarda o HTML estar carregado ===
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token"); // Busca o token salvo no login

  // === [SEGURANÇA] Redireciona para login se não estiver autenticado ===
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  // === 3. Buscar e exibir o e-mail do usuário logado ===
  fetch("http://localhost:8000/auth/perfil", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Token inválido");
      return res.json();
    })
    .then((data) => {
      const email = data.usuario?.email || "Usuário";
      const spanEmail = document.getElementById("user-email");
      if (spanEmail) spanEmail.innerText = email;
    })
    .catch(() => {
      localStorage.removeItem("access_token");
      window.location.href = "/login.html";
    });

  // === 4. Controle do botão de logout ===
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("access_token");
      window.location.href = "/login.html";
    });
  }

  // === 5. Lógica de envio do formulário de novo usuário (se estiver na tela certa) ===
  const form = document.getElementById("formUsuario");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Impede o comportamento padrão de recarregar

      // Coleta os valores digitados
      const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        password: document.getElementById("senha").value,
        tipo_usuario: document.getElementById("grupo").value,
      };

      const mensagem = document.getElementById("mensagem");

      try {
        // Envia para a API FastAPI criar usuário
        const resposta = await fetch("http://localhost:8000/usuarios/criar_usuario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        mensagem.innerText = resultado.msg || "Erro ao cadastrar usuário.";
        mensagem.className = resposta.ok ? "text-success" : "text-danger";

        // Após sucesso, redireciona em 1.5 segundos para a listagem
        if (resposta.ok) {
          form.reset(); // limpa os campos
          setTimeout(() => {
            window.location.href = "/dashboard_usuarios.html";
          }, 1500);
        }

      } catch (error) {
        mensagem.innerText = "Erro ao conectar com o servidor.";
        mensagem.className = "text-danger";
        console.error("Erro:", error);
      }
    });
  }
});
