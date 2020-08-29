LabML App
=========

Get Model Training Updates in Slack
-----------------------------------

An open source library to push charts and updates of your ML/DL model training to `Slack <https://slack.com/intl/en-lk/>`_.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: https://github.com/lab-ml/app/blob/master/images/labml.gif
   :alt: Slack output

How it works? A simple Sine Wave
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Go to  the `App <https://web.lab-ml.com/>`_ and generate a **web_api url**.

2. Add LabML App to your channel.

3. Install the **labml** library

.. code-block:: console

    pip install labml

4. Run the following sample code.

.. code-block:: python

    import numpy as np
    from labml import tracker, experiment, lab

    lab.configure({
    'web_api': 'https://api.lab-ml.com/api/v1/track?labml_token=903c84fba8ca49ca9f215922833e08cf&channel=colab-alerts',
    })

    configs = {
        'fs': 100000,  # sample rate
        'f': 1,  # the frequency of the signal
    }

    x = np.arange(configs['fs'])
    y = np.sin(2 * np.pi * configs['f'] * (x / configs['fs']))

    experiment.create(name='sin_wave')
    experiment.configs(configs)

    with experiment.start():
    for y_i in y:
        tracker.save({'loss': y_i, 'noisy': y_i + np.random.normal(0, 10, 100)})
        tracker.add_global_step()

5. To view updates in slack, please join our Slack workspace `here <https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g>`_.

Links
-----

`📑 Medium Article <https://medium.com/@labml/labml-slack-integration-79519cf9c3a4>`_

`📹 Youtube Video <https://www.youtube.com/watch?v=FY3e1EHqwEE&feature=emb_title>`_

`📓 Kaggle Notebook <https://www.kaggle.com/hnipun/push-ml-dl-model-training-updates-to-slack/>`_
