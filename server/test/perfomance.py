from labml import tracker, experiment
from numpy.random import random

conf = {'batch_size': 20}

with experiment.record(name='sample', exp_conf=conf):
    for i in range(1000):
        values = {'loss': random()}
        for j in range(0, 100):
            values[f'grad.fc.{i}.l1'] = random()
            values[f'grad.fc.{i}.l2'] = random()
            values[f'grad.fc.{i}.mean'] = random()
        tracker.save(i, values)
