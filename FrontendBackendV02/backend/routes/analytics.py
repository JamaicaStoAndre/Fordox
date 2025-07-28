from fastapi import APIRouter
from typing import Dict
from services.supabase_client import supabase
from services.auth_utils import get_user_profile


router = APIRouter()

@router.get("/mock")
def get_mock_data() -> Dict:
    """
    Retorna dados simulados de sensores (mock).
    """
    return {
        "temperatura": [22.5, 23.1, 24.0, 25.2],
        "umidade": [61, 62, 63, 64],
        "agua": [10, 12, 14, 16],
        "timestamp": ["2024-07-01T08:00", "2024-07-01T12:00", "2024-07-01T16:00", "2024-07-01T20:00"]
    }
