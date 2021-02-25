import time
from uuid import uuid4

from labml_db import Model, Key, Index

from .user import User

EXPIRATION_DELAY = 60 * 60 * 24 * 30


def gen_session_id() -> str:
    return uuid4().hex


def gen_expiration() -> float:
    return time.time() + EXPIRATION_DELAY


class Session(Model['Session']):
    session_id: str
    expiration: float
    user: Key[User]

    @classmethod
    def defaults(cls):
        return dict(session_id='',
                    expiration='',
                    user=None
                    )

    @property
    def is_auth(self) -> bool:
        return self.user is not None and self.expiration > time.time()


class SessionIndex(Index['Session']):
    pass


def get_or_create(session_id: str) -> Session:
    if not session_id:
        session_id = gen_session_id()

    session_key = SessionIndex.get(session_id)

    if not session_key:
        session = Session(session_id=session_id,
                          expiration=gen_expiration()
                          )
        session.save()

        SessionIndex.set(session.session_id, session.key)

        return session

    return session_key.load()


def delete(session: Session) -> None:
    SessionIndex.delete(session.session_id)
    session.delete()
