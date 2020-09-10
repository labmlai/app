LabML App
=========

Monitor Machine Learning model training on mobile phones
--------------------------------------------------------

An open-source library to push updates of your ML/DL model training to mobile
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: https://raw.githubusercontent.com/vpj/lab/master/images/mobile.png
   :alt: Mobile view

How it works? A simple Loss curve
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Go to  the `App <https://web.lab-ml.com/>`_ and generate a **web_api url**.

2. Install the **labml** library

.. code-block:: console

    pip install labml

3. Run the following sample code.

.. code-block:: python

    import numpy as np

    from labml import tracker, experiment

    conf = {'batch_size': 20}
    n = 0


    def train():
        global n
        n += 1
        return 0.999 ** n + np.random.random() / 10, 1 - .999 ** n + np.random.random() / 10


    with experiment.record(name='sample', exp_conf=conf, web_api='903c84fba8ca49ca9f215922833e08cf', comment='test'):
        for i in range(100000):
            loss, accuracy = train()
            tracker.save(i, {'loss': loss, 'accuracy': accuracy})

Links
-----

`📑 Sample Link <https://web.lab-ml.com/run?run_uuid=4e91a0e2f37611eabc21a705ed364f19>`_

