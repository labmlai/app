import json
from pathlib import Path
from typing import Dict, Union
from uuid import uuid4

from labml import monit

from . import settings


def generate_token():
    return uuid4().hex


class AuthOInfo:
    def __init__(self, *,
                 sub: str = '',
                 email: str = '',
                 name: str = '',
                 picture: str = '',
                 email_verified: bool = False
                 ):
        self.sub = sub
        self.email = email
        self.name = name
        self.picture = picture
        self.email_verified = email_verified

    def to_dict(self) -> Dict:
        return {
            'sub': self.sub,
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'email_verified': self.email_verified
        }


class User:
    def __init__(self, *,
                 labml_token: str,
                 auth_o_info: Union[AuthOInfo, Dict] = None,
                 is_sharable: bool = False,
                 **kwargs):
        if isinstance(auth_o_info, dict):
            auth_o_info = AuthOInfo(**auth_o_info)

        self.labml_token = labml_token
        self.auth_o_info = auth_o_info
        self.is_sharable = is_sharable

    def to_dict(self) -> Dict:
        return {
            'labml_token': self.labml_token,
            'is_sharable': self.is_sharable,
            'auth_o_info': self.auth_o_info.to_dict(),
        }

    def to_data(self) -> Dict:
        return {
            'labml_token': self.labml_token,
            'is_sharable': self.is_sharable,
            **self.auth_o_info.to_dict()
        }

    @classmethod
    def from_auth_o(cls, labml_token: str, auth_o_info: AuthOInfo):
        return cls(labml_token=labml_token, auth_o_info=auth_o_info)


def save() -> None:
    users = [user.to_dict() for user in _USERS.values()]
    with open(str(settings.DATA_PATH / 'users.json'), 'w') as f:
        json.dump(users, f, indent=4)


_USERS: Dict[str, User] = {}
_AUTH_O_EMAILS: Dict[str, User] = {}


def _initialize() -> None:
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

        if user.auth_o_info and user.auth_o_info.email:
            _AUTH_O_EMAILS[user.auth_o_info.email] = user


with monit.section("Load users"):
    _initialize()


def get(labml_token: str) -> User:
    return _USERS.get(labml_token, None)


def get_or_create_auth_o_user(auth_o_info: AuthOInfo) -> User:
    email = auth_o_info.email
    if email and email in _AUTH_O_EMAILS:
        return _AUTH_O_EMAILS[email]

    user = User.from_auth_o(labml_token=generate_token(), auth_o_info=auth_o_info)
    _AUTH_O_EMAILS[email] = user
    _USERS[user.labml_token] = user
    save()

    return user
