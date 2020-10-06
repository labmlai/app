import json

from glob import glob
from pathlib import Path

from .. import settings
from .. import runs

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
            if 'start_time' not in data:
                run_uuid = data['run_uuid']
                with open(f'{runs_path}/{run_uuid}.status.json', 'r') as f:
                    status = json.load(f)
                    data['start_time'] = status['start_time']

            run = runs.Run(**data)
            run.save()
        except (KeyError, FileNotFoundError) as e:
            print(e)


with monit.section("Move Start Time"):
    _initialize()
