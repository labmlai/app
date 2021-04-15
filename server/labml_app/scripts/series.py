import numpy as np

from labml_app.logger import logger
from labml_app.db import analyses
from labml_app.analyses import series_collection

models = analyses.AnalysisManager.get_db_models()

for s, m, p in models:
    logger.info('modifying ' + p)

    if not issubclass(m, series_collection.SeriesCollection):
        continue

    model_keys = m.get_all()

    for model_key in model_keys:
        ins = model_key.load()
        if len(ins.tracking) > 0:
            for k, v in ins.tracking.items():
                if type(v['value']) != np.ndarray:
                    v['value'] = np.array(v['value'])

                if type(v['last_step']) != np.ndarray:
                    v['last_step'] = np.array(v['last_step'])

        ins.save()
