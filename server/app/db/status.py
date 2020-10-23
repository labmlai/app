import time
from typing import Dict, Union

from labml_db import Model, Key

from ..enums import Enums
from . import run


class RunStatus(Model['RunStatusModel']):
    status: str
    details: object
    time: float

    @classmethod
    def defaults(cls):
        return dict(status='',
                    details=None,
                    time=None
                    )


class Status(Model['Status']):
    last_updated_time: float
    run_status: Key[RunStatus]

    @classmethod
    def defaults(cls):
        return dict(last_updated_time=None,
                    run_status=None
                    )

    def get_data(self) -> Dict[str, any]:
        return {
            'last_updated_time': self.last_updated_time,
            'run_status': self.run_status.load().to_dict()
        }

    def update_time_status(self, data: Dict[str, any]) -> None:
        self.last_updated_time = time.time()

        s = data.get('status', {})
        if s:
            run_status = self.run_status.load()

            run_status.status = s.get('status', run_status.status)
            run_status.details = s.get('details', run_status.details)
            run_status.time = s.get('time', run_status.time)

            run_status.save()

        self.save()


def get_status(run_uuid: str) -> Union[None, Status]:
    r = run.get_run(run_uuid)

    if run:
        return r.status.load()

    return None


def create_status() -> Status:
    time_now = time.time()

    run_status = RunStatus(status=Enums.RUN_IN_PROGRESS, time=time_now)
    status = Status(last_updated_time=time_now,
                    run_status=run_status.key
                    )
    status.save()
    run_status.save()

    return status
