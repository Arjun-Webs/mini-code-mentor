from crewai import Agent, Task, Crew, LLM
from crewai.project import CrewBase, agent, task, crew
from crewai_tools import SerperDevTool


@CrewBase
class MiniCodeMentorCrew:


    llm = LLM(
        model="ollama/llama3.1",
        base_url="http://localhost:11434",
        temperature=0.2,
        max_tokens=400,
        num_ctx=2048
    )


    @agent
    def explain_agent(self):
        return Agent(
            config=self.agents_config["explain_agent"],
            llm=self.llm,
            verbose=False
        )

    @agent
    def bug_agent(self):
        return Agent(
            config=self.agents_config["bug_agent"],
            llm=self.llm,
            verbose=False
        )

    @agent
    def optimize_agent(self):
        return Agent(
            config=self.agents_config["optimize_agent"],
            llm=self.llm,
            verbose=False
        )

    @agent
    def testcase_agent(self):
        return Agent(
            config=self.agents_config["testcase_agent"],
            llm=self.llm,
            verbose=False
        )

    @agent
    def complexity_agent(self):
        return Agent(
            config=self.agents_config["complexity_agent"],
            llm=self.llm,
            verbose=False
        )

    @agent
    def learning_agent(self):
        return Agent(
            config=self.agents_config["learning_agent"],
            llm=self.llm,
            verbose=False,
            tools=[SerperDevTool()]
        )



    @task
    def explain_task(self):
        return Task(config=self.tasks_config["explain_task"])

    @task
    def bug_task(self):
        return Task(config=self.tasks_config["bug_task"])

    @task
    def optimize_task(self):
        return Task(config=self.tasks_config["optimize_task"])

    @task
    def testcase_task(self):
        return Task(config=self.tasks_config["testcase_task"])

    @task
    def complexity_task(self):
        return Task(config=self.tasks_config["complexity_task"])

    @task
    def learning_task(self):
        return Task(config=self.tasks_config["learning_task"])


    @crew
    def explain_crew(self):
        return Crew(
            agents=[self.explain_agent()],
            tasks=[self.explain_task()],
            verbose=False
        )

    @crew
    def bugfix_crew(self):
        return Crew(
            agents=[self.bug_agent()],
            tasks=[self.bug_task()],
            verbose=False
        )

    @crew
    def optimize_crew(self):
        return Crew(
            agents=[self.optimize_agent()],
            tasks=[self.optimize_task()],
            verbose=False
        )

    @crew
    def testcase_crew(self):
        return Crew(
            agents=[self.testcase_agent()],
            tasks=[self.testcase_task()],
            verbose=False
        )

    @crew
    def complexity_crew(self):
        return Crew(
            agents=[self.complexity_agent()],
            tasks=[self.complexity_task()],
            verbose=False
        )

    @crew
    def learning_crew(self):
        return Crew(
            agents=[self.learning_agent()],
            tasks=[self.learning_task()],
            verbose=False
        )