from app.crew.crews import (
    explain_crew,
    bugfix_crew,
    optimize_crew,
    testcase_crew,
    complexity_crew,
    learning_crew
)

def run_crew(mode, user_input):

    if mode == "explain":
        return explain_crew(user_input)

    if mode == "bug":
        return bugfix_crew(user_input)

    if mode == "optimize":
        return optimize_crew(user_input)

    if mode == "testcase":
        return testcase_crew(user_input)

    if mode == "complexity":
        return complexity_crew(user_input)

    if mode == "learning":
        return learning_crew(user_input)

    return "Invalid mode"