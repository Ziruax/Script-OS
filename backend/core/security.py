import os
import json
from base64 import urlsafe_b64encode
import hashlib
from cryptography.fernet import Fernet
from typing import Dict, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
KEY_FILE = os.path.join(DATA_DIR, ".secret.key")
ENV_FILE = os.path.join(DATA_DIR, ".env.enc")

def _get_or_create_cipher() -> Fernet:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(KEY_FILE):
        # Generate persistent machine-specific key
        salt = os.environ.get("SCRIPTOS_SALT", "scriptos_salt_v1_cpu_safe")
        key_raw = hashlib.sha256(f"{salt}_{os.getlogin() if hasattr(os, 'getlogin') else 'local'}".encode()).digest()
        key_b64 = urlsafe_b64encode(key_raw)
        with open(KEY_FILE, "wb") as f:
            f.write(key_b64)
    with open(KEY_FILE, "rb") as f:
        key = f.read()
    return Fernet(key)

def save_api_keys(keys: Dict[str, str]) -> bool:
    """Encrypt and save API keys to data/.env.enc"""
    try:
        cipher = _get_or_create_cipher()
        payload = json.dumps(keys).encode("utf-8")
        encrypted = cipher.encrypt(payload)
        with open(ENV_FILE, "wb") as f:
            f.write(encrypted)
        return True
    except Exception as e:
        print(f"[!] Failed to save encrypted keys: {e}")
        return False

def get_api_keys() -> Dict[str, str]:
    """Read and decrypt stored API keys."""
    if not os.path.exists(ENV_FILE):
        return {}
    try:
        cipher = _get_or_create_cipher()
        with open(ENV_FILE, "rb") as f:
            encrypted = f.read()
        decrypted = cipher.decrypt(encrypted)
        return json.loads(decrypted.decode("utf-8"))
    except Exception as e:
        print(f"[!] Failed to decrypt keys: {e}")
        return {}

def get_key_for_provider(provider: str) -> Optional[str]:
    """Retrieve decrypted key for a specific provider."""
    keys = get_api_keys()
    # Check env var first as fallback
    env_name = f"{provider.upper()}_API_KEY"
    if env_name in os.environ:
        return os.environ[env_name]
    return keys.get(provider.lower())
