import time
import json
from pathlib import Path
from typing import Dict
from uuid import uuid4

from labml import monit

from . import settings

EXPIRATION_DELAY = 60 * 60 * 24 * 30


def get_expiration():
    return time.time() + EXPIRATION_DELAY


def generate_token() -> str:
    return uuid4().hex


class Session:
    def __init__(self, *,
                 session_id: str = '',
                 expiration: float = None,
                 labml_token: str = ''
                 ):
        if expiration is None:
            expiration = get_expiration()

        self.session_id = session_id
        self.labml_token = labml_token
        self.expiration = expiration

    @property
    def is_auth(self):
        return self.labml_token is not '' and self.expiration > time.time()

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'expiration': self.expiration,
            'labml_token': self.labml_token
        }

    def update(self, data: Dict[str, any]):
        self.labml_token = data.get('labml_token', '')
        self.expiration = get_expiration()
        save()


_SESSIONS: Dict[str, Session] = {}


def save():
    sessions = [session.to_dict() for session in _SESSIONS.values()]
    with open(str(settings.DATA_PATH / 'sessions.json'), 'w') as f:
        json.dump(sessions, f, indent=4)


def _initialize():
    path = Path(settings.DATA_PATH / 'sessions.json')
    if not path.exists():
        return

    with open(str(path), 'r') as f:
        sessions = json.load(f)

    if sessions is None:
        sessions = []

    for data in sessions:
        session = Session(**data)
        _SESSIONS[session.session_id] = session


with monit.section("Load sessions"):
    _initialize()


def create() -> Session:
    session = Session(session_id=generate_token())
    _SESSIONS[session.session_id] = session
    save()

    return session


def get_or_create(session_id: str) -> Session:
    if session_id and session_id in _SESSIONS:
        session = _SESSIONS[session_id]
        return session

    return create()
