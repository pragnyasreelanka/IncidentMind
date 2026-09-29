import os
from hindsight_client import Hindsight


class HindsightMemory:
    def __init__(self):
        self.client = Hindsight(
            base_url=os.getenv(
                "HINDSIGHT_BASE_URL",
                "http://localhost:8888"
            )
        )

        self.bank_id = os.getenv(
            "HINDSIGHT_BANK_ID",
            "incidentmind"
        )

    def remember(self, content: str):
        """
        Store an important incident-related memory in Hindsight.
        """
        try:
            self.client.retain(
                bank_id=self.bank_id,
                content=content
            )
            return True

        except Exception as error:
            print(f"Hindsight retain error: {error}")
            return False

    def recall(self, query: str):
        """
        Retrieve relevant previous memories from Hindsight.
        """
        try:
            result = self.client.recall(
                bank_id=self.bank_id,
                query=query
            )

            return result

        except Exception as error:
            print(f"Hindsight recall error: {error}")
            return []