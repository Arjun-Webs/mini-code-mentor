from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ProDebugRequest(BaseModel):
    code: str = Field(..., description="The source code to analyze")
    language: str = Field(..., description="The programming language of the code")
    message: Optional[str] = Field(None, description="Optional conversational message from the user")
    history: Optional[List[Dict[str, str]]] = Field(
        default_factory=list, 
        description="Optional chat history. List of dicts with role and content"
    )

class Metrics(BaseModel):
    maintainability: int = Field(..., ge=0, le=100)
    performance: int = Field(..., ge=0, le=100)
    security: int = Field(..., ge=0, le=100)
    readability: int = Field(..., ge=0, le=100)

class Complexity(BaseModel):
    time: str = Field(..., description="Time complexity (e.g. O(N))")
    space: str = Field(..., description="Space complexity (e.g. O(1))")
    explanation: str = Field(..., description="Brief explanation of the complexity")

# We will break down output models for intermediate agent tools so that the CrewAI parser gets exact structured models back.
class DebugOutput(BaseModel):
    bugs_found: List[str]

class ArchitectOutput(BaseModel):
    issues: List[str]
    refactors: List[str]
    maintainability_score: int = Field(..., ge=0, le=100)
    readability_score: int = Field(..., ge=0, le=100)

class SecurityOutput(BaseModel):
    security_warnings: List[str]
    security_score: int = Field(..., ge=0, le=100)

class PerformanceOutput(BaseModel):
    optimizations: List[str]
    time_complexity: str
    space_complexity: str
    complexity_explanation: str
    performance_score: int = Field(..., ge=0, le=100)

class EdgeCaseOutput(BaseModel):
    edge_cases: List[str]

class ChatOutput(BaseModel):
    chat_response: str


class ProDebugResponse(BaseModel):
    chat_response: str = Field(..., description="A professional conversational explanation of findings")
    bugs_found: List[str] = Field(default_factory=list)
    code_health: int = Field(..., ge=0, le=100)
    metrics: Metrics
    complexity: Complexity
    issues: List[str] = Field(default_factory=list, description="Architectural or structural issues")
    optimizations: List[str] = Field(default_factory=list)
    refactors: List[str] = Field(default_factory=list)
    edge_cases: List[str] = Field(default_factory=list)
    security_warnings: List[str] = Field(default_factory=list)
    production_readiness: int = Field(..., ge=0, le=100, description="Overall production readiness score")
