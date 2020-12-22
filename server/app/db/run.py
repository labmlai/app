import time
from typing import Dict, List, Optional, Union, NamedTuple

from labml_db import Model, Key, Index

from ..utils.mix_panel import MixPanelEvent
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
    note: str
    start_time: float
    run_ip: str
    run_uuid: str
    is_claimed: bool
    status: Key[Status]
    configs: Dict[str, any]
    stdout: str
    logger: str
    stderr: str
    wildcard_indicators: Dict[str, Dict[str, Union[str, bool]]]
    indicators: Dict[str, Dict[str, Union[str, bool]]]
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    comment='',
                    note='',
                    start_time=None,
                    run_uuid='',
                    run_ip='',
                    is_claimed=True,
                    status=None,
                    configs={},
                    stdout='',
                    logger='',
                    stderr='',
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
            self.stdout = self.merge_output(self.stdout, data['stdout'])
        if 'logger' in data and data['logger']:
            self.logger = self.merge_output(self.logger, data['logger'])
        if 'stderr' in data and data['stderr']:
            self.stderr = self.merge_output(self.stderr, data['stderr'])
        if not self.indicators:
            self.indicators = data.get('indicators', {})
        if not self.wildcard_indicators:
            self.wildcard_indicators = data.get('wildcard_indicators', {})

        self.save()

    def merge_output(self, current: str, new: str):
        # TODO optimize to keep all the completed lines and current line separately
        current += new
        if len(new) > 1:
            current = self.format_output(current)

        return current

    @staticmethod
    def format_output(output: str) -> str:
        res = []
        temp = ''
        for i, c in enumerate(output):
            if c == '\n':
                temp += '\n'
                res.append(temp)
                temp = ''
            elif c == '\r' and len(output) > i + 1 and output[i + 1] == '\n':
                pass
            elif c == '\r':
                temp = ''
            else:
                temp += c

        if temp:
            res.append(temp)

        return ''.join(res)

    def get_data(self) -> Dict[str, Union[str, any]]:
        configs = [{'key': k, **c} for k, c in self.configs.items()]

        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'note': self.note,
            'start_time': self.start_time,
            'is_claimed': self.is_claimed,
            'configs': configs,
            'stdout': self.stdout,
            'logger': self.logger,
            'stderr': self.stderr,
        }

    def get_summary(self) -> Dict[str, str]:
        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
        }

    def edit_run(self, data: Dict[str, any]) -> None:
        if 'name' in data:
            self.name = data.get('name', self.name)
        if 'comment' in data:
            self.comment = data.get('comment', self.comment)
        if 'note' in data:
            self.note = data.get('note', self.note)

        self.save()


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
    p.is_run_added = True

    run.save()
    p.save()

    RunIndex.set(run.run_uuid, run.key)

    MixPanelEvent.track('run_created', {'run_uuid': run_uuid,
                                        'run_ip': run_ip,
                                        'labml_token': labml_token}
                        )

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
