import asyncio
import logging
from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.pro_schema import (
    ProDebugRequest,
    ProDebugResponse,
    Metrics,
    Complexity
)

from app.agents.pro_agents import ProAuditCrew

logger = logging.getLogger(__name__)

async def run_full_pro_debug(request: ProDebugRequest) -> ProDebugResponse:
    """
    Orchestrates the CrewAI pro debug agents and returns a structured response.
    """
    try:
        # Initialize the Crew
        crew_manager = ProAuditCrew(
            code=request.code,
            language=request.language,
            message=request.message,
            history=request.history
        )

        # Run the crew in a separate thread so it doesn't block FastAPI
        # result_data contains the merged pydantic models of each task's output
        result_data = await asyncio.to_thread(crew_manager.run)
        
        # Calculate derived metrics based on the prompt's scoring logic
        maintainability = result_data.get("maintainability_score", 50)
        performance = result_data.get("performance_score", 50)
        security = result_data.get("security_score", 50)
        readability = result_data.get("readability_score", 50)

        # code_health = average of all 4
        code_health = int((maintainability + performance + security + readability) / 4)

        # production_readiness = (0.4 * maintainability) + (0.3 * security) + (0.3 * performance)
        prod_readiness = int((0.4 * maintainability) + (0.3 * security) + (0.3 * performance))
        
        # Ensure values are strictly bounded (0-100)
        code_health = max(0, min(100, code_health))
        prod_readiness = max(0, min(100, prod_readiness))

        metrics = Metrics(
            maintainability=maintainability,
            performance=performance,
            security=security,
            readability=readability
        )

        complexity = Complexity(
            time=result_data.get("time_complexity", "Unknown"),
            space=result_data.get("space_complexity", "Unknown"),
            explanation=result_data.get("complexity_explanation", "Not provided")
        )

        response = ProDebugResponse(
            chat_response=result_data.get("chat_response", "Analysis complete."),
            bugs_found=result_data.get("bugs_found", []),
            code_health=code_health,
            metrics=metrics,
            complexity=complexity,
            issues=result_data.get("issues", []),
            optimizations=result_data.get("optimizations", []),
            refactors=result_data.get("refactors", []),
            edge_cases=result_data.get("edge_cases", []),
            security_warnings=result_data.get("security_warnings", []),
            production_readiness=prod_readiness
        )

        return response

    except ValidationError as ve:
        logger.error(f"Validation Error in Pro Debug: {ve}")
        raise HTTPException(status_code=500, detail="Failed to parse agent output into structured format")
    except Exception as e:
        logger.error(f"Error during Pro Debug Crew execution: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during engineering audit")
