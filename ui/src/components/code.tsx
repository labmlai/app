import React from "react";
import {LabLoader} from "./loader"
import {Footer} from './footer'


interface CodeProps {
    labMlToken: string | null
}

function Tab() {
    return <span>
        &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
}

export function Code(props: CodeProps) {
    return <div>
        <LabLoader isLoading={true}/>
        <div className={'text-center'}>
            <h5 className={'text-dark mt-5'}>You don't have any experiments</h5>
            <p className={'text-secondary'}>Start monitoring your models by adding just two lines of code, here is an example</p>
        </div>
        <div className={'mt-3 bg-light container-sm mb-3'}>
            <code className={"text-secondary"}>
                <p>
                    from numpy.random import random<br/>
                    from labml import tracker, experiment
                </p>
                <p className={'mt-3'}>
                    conf = {"{'batch_size': 20}"}<br/>
                </p>
                <p className={'mt-5'}>
                    <span>
                        def train(n: int):<br/>
                     </span>
                    <span>
                        <Tab/>return 0.999 ** n + random() / 10, 1 - .999 ** n +\<br/>
                        <Tab/><Tab/><Tab/>random() / 10
                    </span>
                </p>
                <p className={'mt-5'}>
                    <span className={'font-weight-bolder text-dark'}>
                        with experiment.record(name='sample', exp_conf=conf, <br/>
                        <Tab/><Tab/><Tab/>token='{props.labMlToken}'):<br/>
                    </span>
                    <span>
                        <Tab/>for i in range(100000):<br/>
                    </span>
                    <span>
                       <Tab/><Tab/>loss, accuracy = train(i)<br/>
                    </span>
                    <span className={'font-weight-bolder text-dark'}>
                        <Tab/><Tab/>tracker.save(i, {"{'loss': loss, 'accuracy': "}<br/>
                        <Tab/><Tab/><Tab/>{"accuracy}"})<br/>
                    </span>
                </p>
            </code>
        </div>
        <Footer/>
    </div>
}
