from typing import List, NamedTuple, Dict

from labml_db import Model, Key, Index

from .project import Project, ProjectIndex
from ..utils import gen_token


class User(Model['User']):
    name: str
    sub: str
    email: str
    picture: str
    email_verified: bool
    projects: List[Key[Project]]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    sub='',
                    email='',
                    picture='',
                    email_verified=False,
                    projects=[]
                    )

    @property
    def default_project(self) -> Project:
        return self.projects[0].load()

    def get_data(self) -> Dict[str, any]:
        return {
            'name': self.name,
            'email': self.email,
            'picture': self.picture,
            'projects': [p.load().labml_token for p in self.projects],
            'default_project': self.default_project.labml_token
        }


class UserIndex(Index['User']):
    pass


class AuthOInfo(NamedTuple):
    name: str
    sub: str
    email: str
    picture: str
    email_verified: bool


def get_or_create_user(info: AuthOInfo) -> User:
    user_key = UserIndex.get(info.email)

    if not user_key:
        project = Project(labml_token=gen_token())
        user = User(name=info.name,
                    sub=info.sub,
                    email=info.email,
                    picture=info.picture,
                    email_verified=info.email_verified,
                    projects=[project.key]
                    )

        user.save()
        project.save()

        UserIndex.set(user.email, user.key)
        ProjectIndex.set(project.labml_token, project.key)

        return user

    return user_key.load()
