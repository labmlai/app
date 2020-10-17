import time

from labml_db import Model, Index, Key

from ..enums import Enums


class RunStatus(Model['RunStatusModel']):
    status: str
    details: object
    time: float

    @classmethod
    def defaults(cls):
        return dict(status=Enums.RUN_IN_PROGRESS,
                    details=None,
                    time=None)


class Status(Model['Status']):
    run_uuid: str
    last_updated_time: float
    run_status: Key[RunStatus]

    @classmethod
    def defaults(cls):
        return dict(run_uuid='',
                    last_updated_time=None,
                    run_status=None
                    )


class StatusIndex(Index['Status']):
    pass


def get_or_create(run_uuid: str) -> Status:
    status_key = StatusIndex.get(run_uuid)

    if not status_key:
        time_now = time.time()

        run_status = RunStatus(time=time_now)
        status = Status(run_uuid=run_uuid,
                        last_updated_time=time_now,
                        run_status=run_status)
        status.save()
        run_status.save()

        StatusIndex.set(status.run_uuid, status.key)

        return status

    return status_key.load()
