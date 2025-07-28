# === backend/services/supabase_client.py ===
"""
Cliente Supabase configurado com variáveis de ambiente.
Responsável pela comunicação com a API do Supabase.
"""
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis do arquivo .env

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")

# Inicializa o cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
