import time

from labml_db import Model, Index

from ..enums import Enums


class RunStatusModel:
    status: str
    details: object
    time: float

    def __init__(self, status, details, time):
        self.status = status
        self.details = details
        self.time = time


class Status(Model['Status']):
    run_uuid: str
    last_updated_time: float
    run_status: RunStatusModel

    @classmethod
    def defaults(cls):
        time_now = time.time()

        return dict(run_uuid='',
                    last_updated_time=time_now,
                    run_status=RunStatusModel(status=Enums.RUN_IN_PROGRESS, details=None, time=time_now)
                    )


class StatusIndex(Index['Status']):
    pass


def get_or_create(run_uuid: str) -> Status:
    status_key = StatusIndex.get(run_uuid)

    if not status_key:
        status = Status(run_uuid=run_uuid)
        status.save()
        StatusIndex.set(run_uuid, status.key)

        return status

    return status_key.load()
