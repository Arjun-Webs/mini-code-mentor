from fastapi import APIRouter

from app.schemas.pro_schema import ProDebugRequest, ProDebugResponse
from app.services.pro_service import run_full_pro_debug

router = APIRouter()

@router.post("/pro-debug", response_model=ProDebugResponse)
async def pro_debug(request: ProDebugRequest):
    """
    Trigger the full AI Engineering Audit.
    Runs multiple CrewAI agents (Debug, Architect, Security, Performance, EdgeCase, Chat)
    and returns a strictly structured response.
    """
    return await run_full_pro_debug(request)
