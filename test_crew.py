from app.crew.crews import MiniCodeMentorCrew

crew = MiniCodeMentorCrew()

result = crew.explain_crew().kickoff(
    inputs={"language": "Python", "code": "sample_dict = {'key': 'value'}"}
)

print(result)