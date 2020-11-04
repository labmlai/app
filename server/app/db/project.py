from typing import List, Dict, Union

from labml_db import Model, Key, Index

from .run import Run
from .. import settings


class Project(Model['Project']):
    labml_token: str
    is_sharable: float
    name: str
    runs: Dict[str, Key[Run]]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    is_sharable=False,
                    labml_token='',
                    runs={}
                    )

    def get_runs(self) -> List[Run]:
        res = []
        for run_uuid, run_key in self.runs.items():
            res.append(run_key.load())

        return res


class ProjectIndex(Index['Project']):
    pass


def get_project(labml_token: str) -> Union[None, Project]:
    project_key = ProjectIndex.get(labml_token)

    if project_key:
        return project_key.load()

    return None


def create_project(labml_token: str, name: str):
    project_key = ProjectIndex.get(labml_token)

    if not project_key:
        project = Project(labml_token=labml_token,
                          name=name,
                          is_sharable=True
                          )
        ProjectIndex.set(project.labml_token, project.key)
        project.save()
