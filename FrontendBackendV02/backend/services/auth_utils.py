# === backend/services/auth_utils.py ===
"""
Funções auxiliares para autenticação, como recuperação de perfil.
"""
"""
Funções auxiliares para autenticação, como recuperação de perfil.
"""
from fastapi import HTTPException, Header, Depends
from services.supabase_client import supabase

# Função para buscar o perfil do usuário autenticado
# Utilizada no login para retornar o tipo de usuário (ex: admin, produtor, técnico)
# Busca na tabela 'perfis' com base no UUID do usuário.
# Retorna um dicionário com o nome e tipo de usuário.
# Se não encontrar, retorna tipo_usuario como "desconhecido".
def get_user_profile(user_id: str) -> dict:
    """
    Busca o tipo de perfil do usuário na tabela 'perfis'.

    Args:
        user_id (str): UUID do usuário autenticado.

    Returns:
        dict: Informações do perfil (ex: tipo_usuario)
    """
    response = supabase.table("perfis").select("nome, tipo_usuario").eq("id", user_id).execute()
    data = response.data

    if not data:
        return {"tipo_usuario": "desconhecido"}

    return data[0]


# Função para obter o usuário atual a partir do token JWT
# Utilizada em rotas protegidas para verificar se o usuário está autenticado
# e obter seus dados.

def get_current_user(authorization: str = Header(...)) -> dict:
    """
    Lê o cabeçalho Authorization: Bearer <token>
    - Verifica se o token está presente e bem formatado.
    - Consulta o Supabase para obter os dados do usuário.
    - Retorna os dados se o token for válido.

    Exemplo de cabeçalho:
    Authorization: Bearer eyJhbGciOi...
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token mal formatado")

    token = authorization.split(" ")[1]  # Pega só o valor do token, sem "Bearer"

    try:
        user = supabase.auth.get_user(token).user
        return {
            "id": user.id,
            "email": user.email,
            "metadata": user.user_metadata
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

