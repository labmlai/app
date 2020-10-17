from uuid import uuid4

from typing import List

from labml_db import Model, Key, Index


def generate_token() -> str:
    return uuid4().hex


class Project(Model['Project']):
    labml_token: str
    is_sharable: str
    name: str
    experiments: int

    @classmethod
    def defaults(cls):
        return dict(name='', labml_token=generate_token(), experiments=0)


class User(Model['User']):
    name: str
    sub: str
    email: str
    picture: str
    email_verified: str
    projects: List[Key[Project]]

    @classmethod
    def defaults(cls):
        return dict(name='', sub='', email='', picture='', email_verified=False, projects=[])


class UsernameIndex(Index['User']):
    pass
