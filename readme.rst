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


Example
~~~~~~~

.. code-block:: python

	from labml import tracker, experiment

	with experiment.record(name='sample', exp_conf=conf, token: 'TOKEN from web.lab-ml.com'):
	    for i in range(50):
		loss, accuracy = train()
		tracker.save(i, {'loss': loss, 'accuracy': accuracy})
		
		
**Try our sample Google Colab code** `here <https://colab.research.google.com/drive/1Ldu5tr0oYN_XcYQORgOkIY_Ohsi152fz?usp=sharing>`_.


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


Setup instructions
~~~~~~~~~~~~~~~~~~

1. Requirements: Python 3.7 and npm installed in your machine.

2. Clone the repository

.. code-block:: console

     git@github.com:lab-ml/app.git

3. Install server and ui dependencies

.. code-block:: console

     make setup

4. For server and UI dev

.. code-block:: console

     make server-dev
     make watch-ui

5. For server and UI prod

.. code-block:: console

     make server-prod
     make build-ui



