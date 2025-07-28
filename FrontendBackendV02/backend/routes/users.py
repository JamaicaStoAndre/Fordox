from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from fastapi import APIRouter, Depends
from services.auth_utils import get_current_user

router = APIRouter()

class UserCreateRequest(BaseModel):
    email: str
    password: str
    nome: str
    tipo_usuario: str  # ex: admin, produtor, técnico

@router.post("/criar_usuario")
def criar_usuario(dados: UserCreateRequest):
    try:
        # 1. Cria usuário no Supabase Auth
        user = supabase.auth.admin.create_user({
            "email": dados.email,
            "password": dados.password,
            "email_confirm": True
        })

        user_id = user.user.id

        # 2. Cria perfil vinculado ao usuário
        supabase.table("perfis").insert({
            "id": user_id,
            "nome": dados.nome,
            "tipo_usuario": dados.tipo_usuario
        }).execute()

        return {"success": True, "msg": "Usuário criado com sucesso."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ROTA: LISTAR USUÁRIOS PROTEGIDA POR TOKEN ===
@router.get("/listar")
def listar_usuarios(user=Depends(get_current_user)):
    """
    Retorna todos os usuários cadastrados no Supabase (tabela 'perfis').
    🔒 Requer token JWT no cabeçalho Authorization: Bearer <token>
    ✅ Apenas usuários do tipo 'admin' podem acessar.
    """
    # Busca perfil do usuário autenticado
    perfil = get_user_profile(user['id'])

    # Apenas administradores podem acessar
    if perfil.get("tipo_usuario") != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Permissão insuficiente.")

    # Retorna a lista de perfis com nome, email e tipo
    resultado = supabase.table("perfis").select("nome,email,tipo_usuario").execute()
    return resultado.data
