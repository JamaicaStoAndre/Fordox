# 🌱 Fordox – Plataforma Inteligente de Monitoramento Agropecuário

[![FastAPI](https://img.shields.io/badge/FastAPI-0.103.2-green)](https://fastapi.tiangolo.com/)
[![Docker Compose](https://img.shields.io/badge/Docker--Compose-✅-blue)](https://docs.docker.com/compose/)
[![Supabase](https://img.shields.io/badge/Supabase-integrado-success)](https://supabase.com/)
[![Bootstrap 5](https://img.shields.io/badge/UI-Bootstrap_5-7952B3?logo=bootstrap)](https://getbootstrap.com/)

Fordox é uma aplicação web que une inteligência analítica com usabilidade para modernizar a gestão agropecuária. Com acesso restrito por perfis, painéis visuais e arquitetura modular, é ideal para testes rápidos, validações e expansão futura com IA.

---

## ⚙️ Tecnologias Principais

- **Backend**: FastAPI + Supabase Auth + PostgreSQL
- **Frontend**: HTML + Bootstrap 5 + JS Vanilla
- **Infraestrutura**: Docker, Docker Compose, NGINX

---

## 🧪 Funcionalidades Atuais

| Módulo                | Status   | Descrição                                     |
|-----------------------|----------|-----------------------------------------------|
| Autenticação (Supabase) | ✅      | Login por email e senha via API externa       |
| Cadastro de Usuários   | ✅      | Acesso via painel `admin`, com controle de grupo |
| Painel de Analytics    | ✅      | Visualização de imagem mock + layout base     |
| Separação por Grupos   | 🔄      | Admin, Técnico, Produtor (estrutura inicial)  |

---

## 🚀 Subindo o projeto (modo local com Docker)

1. **Pré-requisitos**:
   - Docker + Docker Compose instalados
   - Variáveis de ambiente definidas (ver `.env.example`)

2. **Comando para rodar:**

```bash
cd infra
docker-compose up --build
```

3. **Acesso:**

- Frontend: http://localhost:3000
- Backend/API: http://localhost:8000
- Documentação Swagger: http://localhost:8000/docs

---

## 📁 Estrutura do Projeto

```
Fordox/
├── backend/              # Backend FastAPI
│   ├── main.py           # Entrypoint da API
│   ├── routes/           # auth, analytics, users
│   ├── services/         # supabase_client, utils
│   └── models/           # schemas Pydantic
├── frontend/             # HTML + CSS + JS + Bootstrap
│   ├── login.html
│   ├── dashboard_admin.html
│   ├── admin_criar_usuario.html
│   └── static/           # CSS, JS, imagens
├── infra/                # docker-compose.yml + Dockerfiles
└── .env.example          # Exemplo de variáveis sensíveis
```

---

## 🛠️ Exemplo de `.env.example`

```ini
# === .env.example ===

# Supabase Config
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...

# App Settings
APP_NAME=Fordox
DEBUG=True
```

> ⚠️ Copie esse arquivo para `.env` e preencha com seus dados antes de subir o projeto.

---

## ✅ Boas Práticas Adotadas

- Separação clara entre frontend e backend
- Dockerização completa com persistência local
- Códigos comentados e organizados por módulos
- Documentação interativa via Swagger

---

## 🔒 Segurança

- Usuários têm acesso restrito com base em grupo
- O painel de cadastro de usuários só é visível para `admin`
- Chaves sensíveis estão fora do repositório (`.env`)

---

## 🤝 Contribuindo

Este projeto está em fase de MVP validado com arquitetura sólida.  
Sugestões, melhorias e PRs são bem-vindos! Para contribuir:

1. Fork o repositório
2. Crie uma branch com sua feature (`git checkout -b minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push e abra um Pull Request

---

**Desenvolvido com 💡 pela Inovabot.com.br**