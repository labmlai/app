import numpy as np

from labml_app.db import project, run, session, blocked_uuids, init_db

init_db()

run_keys = run.Run.get_all()

c = 0
for run_key in run_keys:
    r = run_key.load()
    if r.is_claimed:
        c += 1
        
print(c, len(run_keys))

