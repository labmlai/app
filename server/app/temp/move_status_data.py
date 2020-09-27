import json

from glob import glob
from pathlib import Path

from .. import settings
from .. import statuses

from labml import monit


def _initialize():
    runs_path = Path(settings.DATA_PATH / 'runs')
    if not runs_path.exists():
        runs_path.mkdir(parents=True)

    for f_name in glob(f'{runs_path}/*.json'):
        if 'tracking' in f_name or 'status' in f_name:
            continue

        with open(f_name, 'r') as f:
            data = json.load(f)

        try:
            status = statuses.Status(run_uuid=data['run_uuid'],
                                     start_time=data['start'],
                                     last_updated_time=data['time'],
                                     status={'status': data['status']['status'],
                                             'details': data['status']['status'],
                                             'time': data['time']
                                             })
            status.save()
        except KeyError as e:
            print(e)


with monit.section("Move status data"):
    _initialize()
