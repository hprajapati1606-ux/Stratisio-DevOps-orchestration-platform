from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

# In a real app, this key would be in a secure Vault or KMS
# For this demo, we'll use a fixed key or generate one if missing
MASTER_KEY = os.getenv("STRATISIO_MASTER_KEY")
if not MASTER_KEY:
    # Generate a temporary key if none exists (demo only)
    MASTER_KEY = Fernet.generate_key().decode()

class CredentialManager:
    def __init__(self):
        self.fernet = Fernet(MASTER_KEY.encode())

    def encrypt(self, plain_text: str) -> str:
        if not plain_text: return ""
        return self.fernet.encrypt(plain_text.encode()).decode()

    def decrypt(self, encrypted_text: str) -> str:
        if not encrypted_text: return ""
        return self.fernet.decrypt(encrypted_text.encode()).decode()

credential_manager = CredentialManager()
