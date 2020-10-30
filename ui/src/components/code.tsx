import React from "react";
import {LabLoader} from "./loader"
import {Footer} from './footer'

import "./code.scss"

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
        <LabLoader/>
        <div className={'text-center'}>
            <h3 className={'text-dark mt-5'}>You don't have any experiments</h3>
            <h5 className={'text-dark mt-3'}><a href={'https://web.lab-ml.com/runs?labml_token=samples'}
                                                rel="noopener noreferrer" target="_blank"> Check our sample experiments
                list</a></h5>

            <h6>or</h6>
            <h6 className={'text-dark font-weight-bolder'}>Start monitoring your models by adding just two lines of
                code, here is an example</h6>
        </div>
        <div className={'mt-3 bg-dark container-sm mb-3 pt-1 pb-1'}>
            <code className={"text-white"}>
                <p>
                    <span className={"key-word"}>from</span> numpy.random
                    <span className={"key-word"}> import</span> random <br/>
                    <span className={"key-word"}>from</span> labml <span className={"key-word"}>import</span> tracker,
                    experiment
                </p>
                <p className={'mt-4'}>
                    conf = {"{"}<span className={"string"}>'batch_size'</span>: <span className={"value"}>20</span>{"}"}<br/>
                </p>
                <p className={'mt-4'}>
                    <span>
                        <span className={"key-word"}>def</span>  <span className={"method"}>train</span>(n:
                        <span className={"built-ins"}>int</span>):<br/>
                     </span>
                    <span>
                        <Tab/>lss = <span className={"value"}>0.999</span> ** n + random() /
                        <span className={"value"}>10</span><br/>
                        <Tab/>acc = <span className={"value"}>1</span> - <span className={"value"}>0.999</span> ** n + random() /
                         <span className={"value"}>10</span><br/>
                        <br/>
                        <Tab/><span className={"key-word"}>return</span> lss, acc
                    </span>
                </p>
                <p className={'mt-4'}>
                    <span className={'bold'}>
                        <span className={"key-word"}>with</span> experiment.record(
                        <span className={"param"}>name</span>=<span className={"string"}>'sample'</span>,
                        <span className={"param"}> exp_conf</span>=conf):<br/>
                    </span>
                    <span>
                        <Tab/><span className={"key-word"}>for</span> i
                        <span className={"key-word"}> in</span> <span className={"built-ins"}>range</span>(
                        <span className={"value"}>100000</span>):<br/>
                    </span>
                    <span>
                       <Tab/><Tab/>loss, accuracy = train(i)<br/>
                    </span>
                    <span className={'bold'}>
                        <Tab/><Tab/>tracker.save(i, <span className={"param"}>loss</span>=loss,
                        <span className={"param"}> accuracy</span>=accuracy)
                    </span>
                </p>
            </code>
        </div>
        <Footer/>
    </div>
}
