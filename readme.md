<div align="center" style="margin-bottom: 100px;">
<h1>LabML App</h1>
<h2>Monitor machine learning model training on mobile phones</h2>

<img src="https://raw.githubusercontent.com/lab-ml/lab/master/images/lab_logo.png" width="200px" alt="">

<!-- DO NOT ADD CONDA DOWNLOADS... README CHANGES MUST BE APPROVED BY EDEN OR WILL -->
[![PyPI - Python Version](https://badge.fury.io/py/labml.svg)](https://badge.fury.io/py/labml)
[![PyPI Status](https://pepy.tech/badge/labml)](https://pepy.tech/project/labml)
[![PyPI Status](https://img.shields.io/badge/slack-chat-green.svg?logo=slack)](https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/)
[![Conda](https://img.shields.io/badge/labml-docs-blue)](http://lab-ml.com/)

<img src="https://github.com/lab-ml/app/blob/master/images/mobile-app.gif" width="300" height="600" alt=""/>
</div>

This is an open-source library to push updates of your ML/DL model training to mobile. [Here's a sample experiment](https://web.lab-ml.com/run?run_uuid=347ff5e21c1511eb9452acde48001122).

[You can host this on your own](https://github.com/lab-ml/app/blob/master/docs/installation.rst).
We also have a small [AWS instance running](https://web.lab-ml.com). and you are welcome to use it. Please consider using your own installation if you are running lots of
experiments. Thanks.

### How to use it ?

1. Go to  the [App](https://web.lab-ml.com) and generate a **token**.
2. Install the [labml client library](https://github.com/lab-ml/labml).

```
pip install labml
```
3. Start pushing updates to the app  [with two lines of code](http://lab-ml.com/guide/tracker.html).

### Examples

1. Pytorch ([Google Colab](https://colab.research.google.com/drive/1Ldu5tr0oYN_XcYQORgOkIY_Ohsi152fz?usp=sharing) and  [Kaggle Notebook](https://www.kaggle.com/hnipun/monitoring-ml-model-training-on-your-mobile-phone))

```python
from labml import tracker, experiment

with experiment.record(name='sample', exp_conf=conf):
    for i in range(50):
        loss, accuracy = train()
        tracker.save(i, {'loss': loss, 'accuracy': accuracy})
```

2. TensorFlow 2.0 Keras ([Google Colab](https://colab.research.google.com/drive/1lx1dUG3MGaIDnq47HVFlzJ2lytjSa9Zy?usp=sharing) and `[Kaggle Notebook](https://www.kaggle.com/hnipun/monitor-keras-model-training-on-your-mobile-phone))

```python
from labml import experiment
from labml.utils.keras import LabMLKerasCallback

with experiment.record(name='sample', exp_conf=conf):
    for i in range(50):
        model.fit(x_train, y_train, epochs=conf['epochs'], validation_data=(x_test, y_test),
                  callbacks=[LabMLKerasCallback()], verbose=None)
```

### Citing LabML

If you use LabML for academic research, please cite the library using the following BibTeX entry.

```bibtex
@misc{labml,
 author = {Varuna Jayasiri, Nipun Wijerathne},
 title = {LabML: A library to organize machine learning experiments},
 year = {2020},
 url = {https://lab-ml.com/},
}
```