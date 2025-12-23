import asyncio

from openai import OpenAI

from app.core.config import settings
from app.agents.ai_project_manager_agent import AIProjectManagerAgent


def main():
    client = OpenAI(api_key=settings.openai_api_key)
    agent = AIProjectManagerAgent(client, settings.OPENAI_MODEL)

    async def run():
        r = await agent.generate_tactical_use_cases(
            business_problem="Reduce churn by predicting at-risk customers and triggering retention offers.",
            ai_pattern="Predictive Analytics & Decision Support",
            initiative_details={
                "title": "Churn Reduction",
                "description": "Retain customers",
                "business_objective": "Reduce churn",
            },
            pattern_examples=["Churn prediction", "Retention scoring"],
        )
        print(r)

    asyncio.run(run())


if __name__ == "__main__":
    main()
