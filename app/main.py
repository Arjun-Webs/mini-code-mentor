from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.crew.crews import MiniCodeMentorCrew
from app.routes.pro_debug import router as pro_debug_router
from app.services.stats_manager import stats_manager


app = FastAPI(
    title="Mini Code Mentor API",
    description="AI-powered coding mentor using CrewAI",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    language: str
    code: str



@app.get("/")
async def root():
    return {"status": "🚀 Mini Code Mentor is running"}

@app.get("/user-stats")
async def get_user_stats():
    return stats_manager.get_stats()



@app.post("/explain")
async def explain_code(req: CodeRequest):
    try:
        crew = MiniCodeMentorCrew()
        result = crew.explain_crew().kickoff(
            inputs={"language": req.language, "code": req.code}
        )
        stats_manager.record_explanation()
        return {"result": result.raw.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/bug")
async def bug_fix(req: CodeRequest):
    try:
        crew = MiniCodeMentorCrew()
        result = crew.bugfix_crew().kickoff(
            inputs={"language": req.language, "code": req.code}
        )
        stats_manager.record_bug_fix()
        return {"result": result.raw.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize")
async def optimize_code(req: CodeRequest):
    try:
        crew = MiniCodeMentorCrew()
        result = crew.optimize_crew().kickoff(
            inputs={"language": req.language, "code": req.code}
        )
        stats_manager.record_optimization()
        return {"result": result.raw.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/testcase")
async def generate_testcase(req: CodeRequest):
    try:
        crew = MiniCodeMentorCrew()
        result = crew.testcase_crew().kickoff(
            inputs={"language": req.language, "code": req.code}
        )
        stats_manager.record_testcase()
        return {"result": result.raw.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/complexity")
async def complexity_analysis(req: CodeRequest):
    try:
        crew = MiniCodeMentorCrew()
        result = crew.complexity_crew().kickoff(
            inputs={"language": req.language, "code": req.code}
        )
        stats_manager.record_complexity()
        return {"result": result.raw.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/learning")
async def learning_path(req: CodeRequest):
    try:
        crew = MiniCodeMentorCrew()
        result = crew.learning_crew().kickoff(
            inputs={"language": req.language, "code": req.code}
        )
        return {"result": result.raw.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



app.include_router(
    pro_debug_router,
    prefix="/pro",
    tags=["Pro Mode"]
)