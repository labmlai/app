.. class:: center
.. image:: https://badge.fury.io/py/labml.svg
	   :target: https://badge.fury.io/py/labml
.. image:: https://pepy.tech/badge/labml
	   :target: https://pepy.tech/project/labml
.. image:: https://img.shields.io/badge/slack-chat-green.svg?logo=slack
	   :target: https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/
.. image:: https://img.shields.io/badge/labml-docs-blue
	   :target: http://lab-ml.com/



LabML App - Monitor ML model training on mobile phones
======================================================

This is an open-source library to push updates of your ML/DL model training to mobile.
`Here's a sample experiment <https://web.lab-ml.com/run?run_uuid=4e91a0e2f37611eabc21a705ed364f19>`_.

You can host this on your own. We also have a small `AWS instance running <https://web.lab-ml.com>`_,
and you are welcome to use it. Please consider using your own installation if you are running lots of
experiments. Thanks.

.. image:: https://raw.githubusercontent.com/vpj/lab/master/images/mobile.png
   :alt: Mobile view

How to use it?
~~~~~~~~~~~~~~

1. Go to  the `App <https://web.lab-ml.com/>`_ and generate a **token** (no sign-up required).

2. Install the `labml client library <https://github.com/lab-ml/labml>`_.

.. code-block:: console

    pip install labml

3. Start pushing updates to the app  `with two lines of code <http://lab-ml.com/guide/tracker.html>`_.


Examples
~~~~~~~~

**1. Pytorch**

.. code-block:: python

	from labml import tracker, experiment

	with experiment.record(name='sample', exp_conf=conf, token: 'TOKEN from web.lab-ml.com'):
	    for i in range(50):
		loss, accuracy = train()
		tracker.save(i, {'loss': loss, 'accuracy': accuracy})
		
**Try our Pytorch sample Google Colab code** `here <https://colab.research.google.com/drive/1Ldu5tr0oYN_XcYQORgOkIY_Ohsi152fz?usp=sharing>`_ **and Kaggle Notebook** `here <https://www.kaggle.com/hnipun/monitoring-ml-model-training-on-your-mobile-phone>`_.

		
**2. Keras**

.. code-block:: python

	from labml import experiment
        from labml.utils.keras import LabMLKerasCallback

	with experiment.record(name='MNIST Keras', token: 'TOKEN from web.lab-ml.com'):
            model.fit(x_train, y_train, epochs=5, validation_data=(x_test, y_test),callbacks=[LabMLKerasCallback()], verbose=None)
                  

**Try our Keras sample Google Colab code** `here <https://colab.research.google.com/drive/1lx1dUG3MGaIDnq47HVFlzJ2lytjSa9Zy?usp=sharing>`_ **and Kaggle Notebook** `here <https://www.kaggle.com/hnipun/monitor-keras-model-training-on-your-mobile-phone>`_.



Citing LabML
~~~~~~~~~~~~

If you use LabML for academic research, please cite the library using the following BibTeX entry.

.. code-block:: bibtex

	@misc{labml,
	 author = {Varuna Jayasiri, Nipun Wijerathne},
	 title = {LabML: A library to organize machine learning experiments},
	 year = {2020},
	 url = {https://lab-ml.com/},
	}
