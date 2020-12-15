import time
from typing import Dict, List, Optional, Union, NamedTuple

from labml_db import Model, Key, Index

from . import project
from .status import create_status, Status
from .. import settings


class CardInfo(NamedTuple):
    class_name: str
    name: str
    is_print: bool
    queue_size: int = 0


class Run(Model['Run']):
    name: str
    comment: str
    start_time: float
    run_ip: str
    run_uuid: str
    is_claimed: bool
    status: Key[Status]
    configs: Dict[str, any]
    stdout: List[str]
    logger: List[str]
    stderr: List[str]
    wildcard_indicators: Dict[str, Dict[str, Union[str, bool]]]
    indicators: Dict[str, Dict[str, Union[str, bool]]]
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    comment='',
                    start_time=None,
                    run_uuid='',
                    run_ip='',
                    is_claimed=True,
                    status=None,
                    configs={},
                    stdout=[],
                    logger=[],
                    stderr=[],
                    wildcard_indicators={},
                    indicators={},
                    errors=[]
                    )

    @property
    def url(self) -> str:
        return f'{settings.WEB_URL}/run?run_uuid={self.run_uuid}'

    def update_run(self, data: Dict[str, any]) -> None:
        if not self.name:
            self.name = data.get('name', '')
        if not self.comment:
            self.comment = data.get('comment', '')
        if 'configs' in data:
            self.configs.update(data.get('configs', {}))
        if 'stdout' in data and data['stdout']:
            self.stdout.append(data['stdout'])
        if 'logger' in data and data['logger']:
            self.logger.append(data['logger'])
        if 'stderr' in data and data['stderr']:
            self.stderr.append(data['stderr'])
        if not self.indicators:
            self.indicators = data.get('indicators', {})
        if not self.wildcard_indicators:
            self.wildcard_indicators = data.get('wildcard_indicators', {})

        self.save()

    @staticmethod
    def format_output(output: List[str]) -> str:
        res = []
        for s in output:
            temp = ''
            for i, c in enumerate(s):
                if c == '\n':
                    temp += '\n'
                    res.append(temp)
                    temp = ''
                elif c == '\r' and s[i + 1] == '\n':
                    pass
                elif c == '\r':
                    temp = ''
                else:
                    temp += c

        return ''.join(res)

    def get_data(self) -> Dict[str, Union[str, any]]:
        configs = [{'key': k, **c} for k, c in self.configs.items()]

        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
            'is_claimed': self.is_claimed,
            'configs': configs,
            'stdout': self.format_output(self.stdout),
            'logger': self.format_output(self.logger),
            'stderr': self.format_output(self.stderr),
        }

    def get_summary(self) -> Dict[str, str]:
        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
        }


class RunIndex(Index['Run']):
    pass


def get(run_uuid: str, labml_token: str = '') -> Optional[Run]:
    p = project.get_project(labml_token)

    if run_uuid in p.runs:
        return p.runs[run_uuid].load()
    else:
        return None


def get_or_create(run_uuid: str, labml_token: str = '', run_ip: str = '') -> Run:
    p = project.get_project(labml_token)

    if run_uuid in p.runs:
        return p.runs[run_uuid].load()

    is_claimed = True
    if labml_token == settings.FLOAT_PROJECT_TOKEN:
        is_claimed = False

    time_now = time.time()

    status = create_status()
    run = Run(run_uuid=run_uuid,
              start_time=time_now,
              run_ip=run_ip,
              is_claimed=is_claimed,
              status=status.key,
              )
    p.runs[run.run_uuid] = run.key

    run.save()
    p.save()

    RunIndex.set(run.run_uuid, run.key)

    return run


def get_runs(labml_token: str) -> List[Run]:
    res = []
    p = project.get_project(labml_token)
    for run_uuid, run_key in p.runs.items():
        res.append(run_key.load())

    return res


def get_run(run_uuid: str) -> Optional[Run]:
    run_key = RunIndex.get(run_uuid)

    if run_key:
        return run_key.load()

    return None


def get_status(run_uuid: str) -> Union[None, Status]:
    r = get_run(run_uuid)

    if r:
        return r.status.load()

    return None
