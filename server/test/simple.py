import time

from numpy.random import random

from labml import tracker, experiment

conf = {'batch_size': 20}

with experiment.record(name='sample', exp_conf=conf, writers={'web_api'}):
    for i in range(1000):
        time.sleep(0.2)
        values = {'loss': random()}
        tracker.save(i, values)
