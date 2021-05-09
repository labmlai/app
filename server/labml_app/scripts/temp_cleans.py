import numpy as np

from labml_app.db import init_db
from labml_app.analyses.experiments import hyperparameters


def clean_hyper_parameters():
    hp_keys = hyperparameters.HyperParamsModel.get_all()

    for hp_key in hp_keys:
        hp = hp_key.load()
        for k, v in hp.tracking.items():
            if type(v['step']) == list:
                v['step'] = np.array(v['step'])

        for k, v in hp.hp_series.items():
            if type(v['step']) == list:
                v['step'] = np.array(v['step'])

            if type(v['value']) == list:
                v['value'] = np.array(v['value'])

        hp.save()


if __name__ == "__main__":
    init_db()
    clean_hyper_parameters()
