import json
from pathlib import Path
from typing import Dict, Union
from uuid import uuid4

from labml import monit

from . import settings


def generate_token():
    return uuid4().hex


class GoogleInfo:
    def __init__(self, *,
                 sub: str = '',
                 email: str = '',
                 name: str = ''):
        self.sub = sub
        self.email = email
        self.name = name

    def to_dict(self):
        return {
            'sub': self.sub,
            'email': self.email,
            'name': self.name
        }


class User:
    def __init__(self, *,
                 labml_token: str,
                 google_info: Union[GoogleInfo, Dict] = None,
                 is_sharable: bool = False):
        if isinstance(google_info, dict):
            google_info = GoogleInfo(**google_info)

        self.labml_token = labml_token
        self.google_info = google_info
        self.is_sharable = is_sharable

    def to_dict(self):
        return {
            'labml_token': self.labml_token,
            'is_sharable': self.is_sharable,
            'google_info': self.google_info.to_dict()
        }

    @classmethod
    def from_google_info(cls, labml_token: str, google_info: GoogleInfo):
        return cls(labml_token=labml_token, google_info=google_info)


_USERS: Dict[str, User] = {}
_GOOGLE_SUBS: Dict[str, User] = {}


def save():
    users = [user.to_dict() for user in _USERS.values()]
    with open(str(settings.DATA_PATH / 'users.json'), 'w') as f:
        json.dump(users, f, indent=4)


def _initialize():
    path = Path(settings.DATA_PATH / 'users.json')
    if not path.exists():
        return

    with open(str(path), 'r') as f:
        users = json.load(f)

    if users is None:
        users = []

    for data in users:
        user = User(**data)
        _USERS[user.labml_token] = user

        if user.google_info and user.google_info.sub:
            _GOOGLE_SUBS[user.google_info.sub] = user


with monit.section("Load users"):
    _initialize()


def is_valid_user(labml_token: str) -> bool:
    if labml_token and labml_token in _USERS:
        return True

    return False


def get(labml_token: str) -> User:
    return _USERS.get(labml_token, None)


def get_or_create_google_user(google_info: GoogleInfo) -> User:
    sub = google_info.sub
    if sub and sub in _GOOGLE_SUBS:
        return _GOOGLE_SUBS[sub]

    user = User.from_google_info(labml_token=generate_token(), google_info=google_info)
    _GOOGLE_SUBS[sub] = user
    _USERS[user.labml_token] = user
    save()

    return user
