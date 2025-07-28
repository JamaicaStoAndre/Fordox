# === backend/routes/auth.py ===
"""
Rotas de autenticação utilizando Supabase.
Inclui o endpoint de login e verificação do tipo de perfil.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.auth_utils import get_user_profile
from fastapi import Depends, Header
from services.auth_utils import get_current_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login_user(credentials: LoginRequest):
    """
    Endpoint de login de usuário.
    - Autentica usuário via Supabase.
    - Retorna perfil e token de acesso.
    """
    try:
        result = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        user_id = result.user.id  # UUID do usuário
        perfil = get_user_profile(user_id)

        return {
            "success": True,
            "perfil": perfil,
            "access_token": result.session.access_token
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Credenciais inválidas ou erro de autenticação.")


##Rota protegida para obter perfil autenticado
@router.get("/perfil")
def get_perfil_autenticado(user_data: dict = Depends(get_current_user)):
    """
    Esta rota é PROTEGIDA — só funciona se o usuário enviar um token válido no cabeçalho.
    - O token é obtido no login.
    - A função get_current_user verifica se o token é válido.
    - Se for, retorna os dados do usuário autenticado.
    """
    return {
        "msg": "Perfil autenticado com sucesso",
        "usuario": user_data
    }
