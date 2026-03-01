import os
from crewai import Agent, Task, Crew, Process
from pydantic import BaseModel

from app.schemas.pro_schema import (
    DebugOutput,
    ArchitectOutput,
    SecurityOutput,
    PerformanceOutput,
    EdgeCaseOutput,
    ChatOutput
)

class ProAuditCrew:
    def __init__(self, code: str, language: str, message: str = None, history: list = None):
        self.code = code
        self.language = language
        self.message = message or ""
        self.history = history or []

    # ===============================
    # AGENTS
    # ===============================

    def _debug_agent(self) -> Agent:
        return Agent(
            role="Senior Debugger",
            goal="Find logical, runtime, and syntax issues in the code.",
            backstory="An expert debugger with years of finding the most elusive bugs in production systems.",
            verbose=False,
            # allow_delegation=False, # Removed as per new CrewAI defaults
        )

    def _architect_agent(self) -> Agent:
        return Agent(
            role="Software Architect",
            goal="Review code structure, maintainability, readability, and suggest refactors. You must provide scores between 0 and 100.",
            backstory="A seasoned software architect who designs clean, scalable, and maintainable systems.",
            verbose=False,
        )

    def _security_agent(self) -> Agent:
        return Agent(
            role="Security Auditor",
            goal="Detect vulnerabilities and security risks. You must provide a security score between 0 and 100.",
            backstory="A cybersecurity expert specializing in secure coding practices and vulnerability assessment.",
            verbose=False,
        )

    def _performance_agent(self) -> Agent:
        return Agent(
            role="Performance Engineer",
            goal="Analyze time and space complexity, suggest optimizations. You must provide a performance score between 0 and 100.",
            backstory="An optimization guru obsessed with Big-O notation, speed, and memory efficiency.",
            verbose=False,
        )

    def _edge_case_agent(self) -> Agent:
        return Agent(
            role="QA Automation Expert",
            goal="Identify boundary, edge, and corner cases based on the code and previous findings.",
            backstory="A meticulous QA engineer who thinks of every possible way a system can break.",
            verbose=False,
        )

    def _chat_agent(self) -> Agent:
        return Agent(
            role="Lead Developer Communicator",
            goal="Synthesize all findings into a professional, conversational response addressing the user's message and history.",
            backstory="A friendly, articulate tech lead who explains complex engineering audits clearly to developers.",
            verbose=False,
        )

    # ===============================
    # TASKS
    # ===============================

    def _debug_task(self) -> Task:
        return Task(
            description=f"Analyze the following {self.language} code for bugs.\n\nCode:\n{self.code}",
            expected_output="A list of specific bugs found.",
            agent=self._debug_agent(),
            output_pydantic=DebugOutput
        )

    def _architect_task(self) -> Task:
        return Task(
            description=f"Review the {self.language} code for architectural issues and refactoring opportunities. Assign maintainability and readability scores (0-100).\n\nCode:\n{self.code}",
            expected_output="Architectural issues, refactor suggestions, and scores.",
            agent=self._architect_agent(),
            output_pydantic=ArchitectOutput
        )

    def _security_task(self) -> Task:
        return Task(
            description=f"Perform a security assessment on the following {self.language} code. Assign a security score (0-100).\n\nCode:\n{self.code}",
            expected_output="Security warnings and a score.",
            agent=self._security_agent(),
            output_pydantic=SecurityOutput
        )

    def _performance_task(self) -> Task:
        return Task(
            description=f"Analyze time/space complexity and suggest optimizations for the {self.language} code. Assign a performance score (0-100).\n\nCode:\n{self.code}",
            expected_output="Complexity analysis, optimizations, and a score.",
            agent=self._performance_agent(),
            output_pydantic=PerformanceOutput
        )

    def _edge_case_task(self, context_tasks: list) -> Task:
        return Task(
            description=f"Based on the {self.language} code and previous agent findings, identify potential edge and corner cases.\n\nCode:\n{self.code}",
            expected_output="A list of edge cases.",
            agent=self._edge_case_agent(),
            context=context_tasks,
            output_pydantic=EdgeCaseOutput
        )

    def _chat_task(self, context_tasks: list) -> Task:
        history_text = "\n".join([f"{h['role']}: {h['content']}" for h in self.history])
        return Task(
            description=f"Write a comprehensive conversational response synthesizing the audit findings. "
                        f"Address the user's specific message: '{self.message}'. "
                        f"Context History:\n{history_text}",
            expected_output="A professional conversational response.",
            agent=self._chat_agent(),
            context=context_tasks,
            output_pydantic=ChatOutput
        )

    # ===============================
    # CREW EXECUTION
    # ===============================

    def get_crew(self) -> Crew:
        # Step 1 Tasks (Parallelizable conceptually, but CrewAI handles sequential by default unless customized. 
        # We will keep them sequential for reliability or explicitly use context.)
        t_debug = self._debug_task()
        t_security = self._security_task()
        t_performance = self._performance_task()
        
        # Step 2 Task
        t_architect = self._architect_task()
        
        # Step 3 Task
        t_edge = self._edge_case_task(context_tasks=[t_debug, t_security, t_performance, t_architect])
        
        # Step 4 Task
        t_chat = self._chat_task(context_tasks=[t_debug, t_security, t_performance, t_architect, t_edge])

        return Crew(
            agents=[
                self._debug_agent(),
                self._security_agent(),
                self._performance_agent(),
                self._architect_agent(),
                self._edge_case_agent(),
                self._chat_agent(),
            ],
            tasks=[
                t_debug,
                t_security,
                t_performance,
                t_architect,
                t_edge,
                t_chat
            ],
            process=Process.sequential, # Sequential ensures contexts are passed properly
            verbose=False,
        )

    def run(self) -> dict:
        """
        Executes the crew and returns the aggregated output models.
        """
        crew = self.get_crew()
        
        # Kickoff returns CrewOutput
        crew_output = crew.kickoff()
        
        # We extract the output of each task.
        # crew.tasks retains the output in `task.output.pydantic`
        results = {}
        for task in crew.tasks:
            if task.output and task.output.pydantic:
                # Merge the dictionary representation of the pydantic model into results
                results.update(task.output.pydantic.model_dump())
        
        return results
