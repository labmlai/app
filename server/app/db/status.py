from labml_db import Model, Key

from ..enums import Enums


class RunStatus(Model['RunStatus']):
    status: str
    details: object
    time: float

    @classmethod
    def defaults(cls):
        return dict(status=Enums.RUN_IN_PROGRESS, details=None, time=None)


class Status(Model['Status']):
    run_uuid: str
    last_updated_time: float
    run_status: Key[RunStatus]

    @classmethod
    def defaults(cls):
        return dict(run_uuid='', last_updated_time=None, run_status=None)
