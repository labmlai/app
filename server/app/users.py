import json
from pathlib import Path
from typing import Dict
from uuid import uuid4

from labml import monit

from . import settings


def generate_token():
    return uuid4().hex


class User:
    def __init__(self, *,
                 labml_token: str,
                 slack_token: str = ''):
        self.labml_token = labml_token
        self.slack_token = slack_token

    def to_dict(self):
        return {
            'slack_token': self.slack_token,
            'labml_token': self.labml_token
        }


_USERS: Dict[str, User] = {}
_SLACK_TOKENS: Dict[str, User] = {}


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

        if user.slack_token:
            _SLACK_TOKENS[user.slack_token] = user


with monit.section("Load users"):
    _initialize()


def get_or_create(*, labml_token: str = '', slack_token: str = ''):
    if labml_token and labml_token in _USERS:
        return _USERS[labml_token]

    if slack_token and slack_token in _SLACK_TOKENS:
        return _SLACK_TOKENS[slack_token]

    user = User(labml_token=generate_token())
    _USERS[user.labml_token] = user
    save()

    return user


def get(*, labml_token: str) -> User:
    return _USERS.get(labml_token, None)
