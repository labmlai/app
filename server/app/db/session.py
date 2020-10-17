import time
from uuid import uuid4

from labml_db import Model, Key, Index

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
        return dict(session_id=generate_session_id(),
                    expiration=Session.get_expiration(),
                    user=None
                    )

    @staticmethod
    def get_expiration() -> float:
        return time.time() + EXPIRATION_DELAY

    @property
    def is_auth(self) -> bool:
        return self.user is not None and self.expiration > time.time()


class SessionIndex(Index['Session']):
    pass


def get_or_create(session_id: str) -> Session:
    session_key = SessionIndex.get(session_id)

    if not session_key:
        session = Session()

        session.save()

        SessionIndex.set(session.session_id, session.key)

        return session

    return session_key.load()
