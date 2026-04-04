import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class PrivacyConfig:
    enabled: bool
    vaultAddress: str


class PrivacyManager:
    def __init__(self):
        self.dry_run = os.environ.get("DRY_RUN") == "true"

    def prompt_user(self, recommended: bool, auto: bool = False) -> PrivacyConfig:
        if auto:
            print(f"\n🛡️  [Privacy] Auto-mode: Selected {'YES' if recommended else 'NO'} based on AI recommendation.")
            return PrivacyConfig(
                enabled=recommended,
                vaultAddress=os.environ.get("PRIVACY_VAULT_ADDRESS", "0.0.mock_vault"),
            )

        print("\n=======================================================")
        print("🛡️  PRIVACY OPTION  🛡️")
        print("-------------------------------------------------------")
        print("Do you want to execute this trade in PRIVATE mode?")
        print(" - YES: TEE execution, no public audit log, hashed on-chain")
        print(" - NO : Public on-chain audit trail")
        print(f"\nAI Recommendation: {'YES (High Risk / Alpha)' if recommended else 'NO (Low Risk)'}")

        if self.dry_run and os.environ.get("MOCK_USER_INPUT"):
            print("> Automatically answering YES for demo...")
            return PrivacyConfig(enabled=True, vaultAddress="0.0.mock_vault")

        answer = input("\nEnable Privacy? (Y/n): ").strip().lower()
        is_yes = answer in ("y", "")
        print(f"\n🔒 Privacy Mode: {'ENABLED' if is_yes else 'DISABLED'}")
        return PrivacyConfig(
            enabled=is_yes,
            vaultAddress=os.environ.get("PRIVACY_VAULT_ADDRESS", ""),
        )
