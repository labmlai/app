import hashlib

from .. import users
from .. import settings

BYTE_SALT = settings.SALT.encode()


def hash_password(password: str) -> bytes:
    x1 = hashlib.sha256(password.encode())
    x1.update(BYTE_SALT)

    return x1.digest()


def sign_in(email: str, password: str):
    password_hash = hash_password(password)

    labml_info = users.LabMlInfo(email=email, password_hash=password_hash)
    user = users.get_or_create_labml_user(labml_info)

    return user
