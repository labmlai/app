from labml import tracker, experiment
from numpy.random import random

conf = {'batch_size': 20}

with experiment.record(name='sample', exp_conf=conf, writers={'web_api'}):
    for i in range(1000):
        values = {'loss': random()}
        for j in range(0, 100):
            values[f'grad.fc.{j}.l1'] = random()
            values[f'grad.fc.{j}.l2'] = random()
            values[f'grad.fc.{j}.mean'] = random()
        tracker.save(i, values)
