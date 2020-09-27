import hashlib

from .. import users
from .. import settings

BYTE_SALT = settings.SALT.encode()


def hash_password(password: str) -> bytes:
    hs = hashlib.sha256(password.encode())
    hs.update(BYTE_SALT)

    return hs.digest()


def sign_in(email: str, password: str):
    password_hash = hash_password(password)

    labml_info = users.LabMlInfo(email=email, password_hash=password_hash)
    user = users.get_or_create_labml_user(labml_info)

    return user
