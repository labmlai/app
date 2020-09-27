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


class LabMlInfo:
    def __init__(self, *,
                 email: str = '',
                 password_hash: bytes = b''):
        self.email = email
        self.password_hash = password_hash

    def to_dict(self):
        return {
            'email': self.email,
            'password_hash': self.password_hash
        }


class User:
    def __init__(self, *,
                 labml_token: str,
                 google_info: Union[GoogleInfo, Dict] = None,
                 labml_info: Union[LabMlInfo, Dict] = None,
                 is_sharable: bool = False):
        if isinstance(google_info, dict):
            google_info = GoogleInfo(**google_info)

        if isinstance(labml_info, dict):
            labml_info = LabMlInfo(**labml_info)

        self.labml_token = labml_token
        self.google_info = google_info
        self.labml_info = labml_info
        self.is_sharable = is_sharable

    def to_dict(self):
        return {
            'labml_token': self.labml_token,
            'is_sharable': self.is_sharable,
            'google_info': self.google_info.to_dict(),
            'labml_info': self.labml_info.to_dict()
        }

    @classmethod
    def from_google(cls, labml_token: str, google_info: GoogleInfo):
        return cls(labml_token=labml_token, google_info=google_info)

    @classmethod
    def from_labml(cls, labml_token: str, labml_info: LabMlInfo):
        return cls(labml_token=labml_token, labml_info=labml_info)


def save():
    users = [user.to_dict() for user in _USERS.values()]
    with open(str(settings.DATA_PATH / 'users.json'), 'w') as f:
        json.dump(users, f, indent=4)


_USERS: Dict[str, User] = {}

_GOOGLE_SUBS: Dict[str, User] = {}
_LABML_HASHES: Dict[bytes, User] = {}


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

        if user.labml_info and user.labml_info.password_hash:
            _LABML_HASHES[user.labml_info.password_hash] = user


with monit.section("Load users"):
    _initialize()


def get(labml_token: str) -> User:
    return _USERS.get(labml_token, None)


def get_or_create_google_user(google_info: GoogleInfo) -> User:
    sub = google_info.sub
    if sub and sub in _GOOGLE_SUBS:
        return _GOOGLE_SUBS[sub]

    user = User.from_google(labml_token=generate_token(), google_info=google_info)
    _GOOGLE_SUBS[sub] = user
    _USERS[user.labml_token] = user
    save()

    return user


def get_or_create_labml_user(labml_info: LabMlInfo) -> User:
    password_hash = labml_info.password_hash
    if password_hash and password_hash in _LABML_HASHES:
        return _LABML_HASHES[password_hash]

    user = User.from_labml(labml_token=generate_token(), labml_info=labml_info)
    _LABML_HASHES[password_hash] = user
    _USERS[user.labml_token] = user
    save()

    return user
