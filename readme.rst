LabML App
=========

Monitor Machine Learning model training on mobile phones
--------------------------------------------------------

An open-source library to push updates of your ML/DL model training to mobile
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: https://raw.githubusercontent.com/vpj/lab/master/images/mobile.png
   :alt: Mobile view

How it works? A simple Sine Wave
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Go to  the `App <https://web.lab-ml.com/>`_ and generate a **web_api url**.

2. Install the **labml** library

.. code-block:: console

    pip install labml

3. Run the following sample code.

.. code-block:: python

    import numpy as np
    from labml import tracker, experiment

    configs = {
        'fs': 100000,  # sample rate
        'f': 1,  # the frequency of the signal
    }

    x = np.arange(configs['fs'])
    y = np.sin(2 * np.pi * configs['f'] * (x / configs['fs']))

    experiment.record(name='sin_wave', conf_dict=configs, lab_conf={'web_api':
                      'https://api.lab-ml.com/api/v1/track?labml_token=${props.labMlToken}'})
    with experiment.start():
        for y_i in y:
            tracker.save({'loss': y_i, 'noisy': y_i + np.random.normal(0, 10, 100)})
            tracker.add_global_step()

Links
-----

`📑 Medium Article <https://medium.com/@labml/labml-slack-integration-79519cf9c3a4>`_

`📹 Youtube Video <https://www.youtube.com/watch?v=FY3e1EHqwEE&feature=emb_title>`_

`📓 Kaggle Notebook <https://www.kaggle.com/hnipun/push-ml-dl-model-training-updates-to-slack/>`_
