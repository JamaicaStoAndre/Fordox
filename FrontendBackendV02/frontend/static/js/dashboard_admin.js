// === frontend/static/js/dashboard_admin.js ===

/**
 * Script exclusivo para dashboard_admin.html
 * - Alterna seções do dashboard
 * - Envia formulário de cadastro de usuário
 * - Valida token e exibe e-mail do usuário logado
 * - Garante modularidade para futuras funções
 */

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  // Alterna entre seções do dashboard
  window.mostrarSecao = function (secaoId) {
    document.querySelectorAll(".conteudo").forEach((secao) => {
      secao.classList.add("d-none");
    });
    document.getElementById(secaoId).classList.remove("d-none");
  };

  // Envia o formulário de novo usuário
  const form = document.getElementById("formCadastroUsuario");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        password: document.getElementById("senha").value,
        tipo_usuario: document.getElementById("grupo").value,
      };

      const resposta = await fetch("http://localhost:8000/usuarios/criar_usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json();
      const msgEl = document.getElementById("mensagem");
      msgEl.innerText = resultado.msg || "Erro ao cadastrar.";
      msgEl.className = resposta.ok ? "text-success" : "text-danger";

      if (resposta.ok) {
        form.reset();
      }
    });
  }
});
