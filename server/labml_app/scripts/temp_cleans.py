import numpy as np

from labml_app.db import init_db
from labml_app.analyses.experiments import hyperparameters


def clean_hyper_parameters():
    hp_keys = hyperparameters.HyperParamsModel.get_all()

    for hp_key in hp_keys:
        hp = hp_key.load()

        for k, v in hp.hp_series.items():
            if type(v['step']) == np.ndarray:
                v['step'] = v['step'].tolist()

            if type(v['value']) == np.ndarray:
                v['value'] = v['value'].tolist()

        hp.save()


if __name__ == "__main__":
    init_db()
    clean_hyper_parameters()
