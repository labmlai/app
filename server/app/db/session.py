import time
from uuid import uuid4

from labml_db import Model, Key

from .user import User

EXPIRATION_DELAY = 60 * 60 * 24 * 30


def generate_session_id() -> str:
    return uuid4().hex


class Session(Model['Session']):
    session_id: str
    expiration: float
    user: Key[User]

    @classmethod
    def defaults(cls):
        return dict(session_id=generate_session_id(), expiration=Session.get_expiration(), run_status=None)

    @staticmethod
    def get_expiration() -> float:
        return time.time() + EXPIRATION_DELAY

    @property
    def is_auth(self) -> bool:
        return self.user.load().email is not '' and self.expiration > time.time()
