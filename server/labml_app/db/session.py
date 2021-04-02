import time
from typing import Dict, List, Optional, Union

from labml_db import Model, Key, Index

from .. import utils

from . import project
from . import computer
from . import status
from .. import settings


class Session(Model['Session']):
    name: str
    comment: str
    start_time: float
    computer_ip: str
    computer_uuid: str
    session_uuid: str
    is_claimed: bool
    status: Key[status.Status]
    configs: Dict[str, any]
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    comment='',
                    start_time=None,
                    computer_uuid='',
                    session_uuid='',
                    is_claimed=True,
                    computer_ip='',
                    status=None,
                    configs={},
                    errors=[]
                    )

    @property
    def url(self) -> str:
        return f'{settings.WEB_URL}/session/{self.session_uuid}'

    def update_session(self, data: Dict[str, any]) -> None:
        if not self.name:
            self.name = data.get('name', '')
        if not self.comment:
            self.comment = data.get('comment', '')
        if 'configs' in data:
            self.configs.update(data.get('configs', {}))

        self.save()

    def get_data(self) -> Dict[str, Union[str, any]]:
        return {
            'computer_uuid': self.computer_uuid,
            'session_uuid': self.session_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
            'is_claimed': self.is_claimed,
            'configs': [],
        }

    def get_summary(self) -> Dict[str, str]:
        return {
            'computer_uuid': self.computer_uuid,
            'session_uuid': self.session_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
        }

    def edit_session(self, data: Dict[str, any]) -> None:
        if 'name' in data:
            self.name = data.get('name', self.name)
        if 'comment' in data:
            self.comment = data.get('comment', self.comment)

        self.save()


class SessionIndex(Index['Session']):
    pass


def get(session_uuid: str, labml_token: str = '') -> Optional[Session]:
    p = project.get_project(labml_token)

    if session_uuid in p.sessions:
        return p.sessions[session_uuid].load()
    else:
        return None


def get_or_create(session_uuid: str, computer_uuid: str, labml_token: str = '', computer_ip: str = '') -> Session:
    p = project.get_project(labml_token)

    if session_uuid in p.sessions:
        return p.sessions[session_uuid].load()

    if labml_token == settings.FLOAT_PROJECT_TOKEN:
        is_claimed = False
    else:
        is_claimed = True

        from . import user
        identifier = user.get_token_owner(labml_token)
        utils.mix_panel.MixPanelEvent.track('session_claimed', {'session_uuid': session_uuid}, identifier=identifier)
        utils.mix_panel.MixPanelEvent.computer_claimed_set(identifier)

    time_now = time.time()

    s = status.create_status()
    session = Session(session_uuid=session_uuid,
                      computer_uuid=computer_uuid,
                      start_time=time_now,
                      computer_ip=computer_ip,
                      is_claimed=is_claimed,
                      status=s.key,
                      )
    p.sessions[session.session_uuid] = session.key

    session.save()
    p.save()

    SessionIndex.set(session.session_uuid, session.key)

    computer.add_session(computer_uuid, session_uuid)

    utils.mix_panel.MixPanelEvent.track('session_created', {'session_uuid': session_uuid, 'labml_token': labml_token})

    return session


def get_sessions(labml_token: str) -> List[Session]:
    res = []
    p = project.get_project(labml_token)
    for session_uuid, session_key in p.sessions.items():
        res.append(session_key.load())

    return res


def get_session(session_uuid: str) -> Optional[Session]:
    session_key = SessionIndex.get(session_uuid)

    if session_key:
        return session_key.load()

    return None


def get_status(session_uuid: str) -> Union[None, status.Status]:
    s = get_session(session_uuid)

    if s:
        return s.status.load()

    return None
