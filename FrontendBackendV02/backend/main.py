# === backend/main.py ===
"""
Arquivo principal da API FastAPI
- Inicializa a aplicação com rotas
- Configura CORS para permitir acesso externo
- Define metadados para documentação Swagger
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.supabase_client import supabase
from services.auth_utils import get_user_profile
from routes import auth, analytics, users  # importando as rotas

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Instância principal do app
app = FastAPI(
    title="Fordox API",
    version="0.1.0",
    description="API da plataforma Fordox para gerenciamento de dados agropecuários, login e análises.",
    openapi_tags=[
        {"name": "Autenticação", "description": "Operações de login de usuário com Supabase."},
        {"name": "Analytics", "description": "Consulta a dados sensoriais e mock de teste."}
    ]
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas principais
app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(analytics.router, prefix="/dados", tags=["Analytics"])
app.include_router(users.router, prefix="/usuarios", tags=["Usuários"])  # corrigido


# Endpoint raiz (sanidade da API)
@app.get("/")
def read_root():
    return {"msg": "API Fordox ativa!"}


# Corrigido:
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

@app.get("/")
def root():
    return FileResponse("frontend/index.html")

@app.get("/login.html")
def login():
    return FileResponse("frontend/login.html")

@app.get("/dashboard_admin.html")
def dashboard():
    return FileResponse("frontend/dashboard_admin.html")
