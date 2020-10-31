import React from "react";
import {LabLoader} from "./loader"
import {Footer} from './footer'

import "./code.scss"

function Tab() {
    return <span>
        &nbsp;&nbsp;&nbsp;
    </span>
}

export function Code() {
    return <div>
        <LabLoader/>
        <div className={'text-center'}>
            <h5 className={'text-secondary mt-5'}>You don't have any experiments</h5>
            <h6 className={'text-dark mt-3'}><a href={'https://web.lab-ml.com/runs?labml_token=samples'}
                                                rel="noopener noreferrer" target="_blank"> Check our sample experiments
                list</a></h6>

            <h6>or</h6>
            <h6 className={'text-dark font-weight-bolder'}>Start monitoring your models by adding just two lines of
                code, here is an example</h6>
        </div>
        <div className={'mt-3 bg-dark container mb-3 pt-1 pb-1'}>
            <code className={"text-white"}>
                <p>
                    <span className={"key-word"}>from</span> numpy.random
                    <span className={"key-word"}> import</span> random <br/>
                    <span className={"key-word"}>from</span> labml <span className={"key-word"}>import</span> tracker,
                    experiment as exp
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
                        <Tab/>loss = <span className={"value"}>0.999</span> ** n + random() /
                        <span className={"value"}>10</span><br/>
                        <Tab/>accuracy = <span className={"value"}>1</span> - <span className={"value"}>0.999</span> ** n + random() /
                         <span className={"value"}>10</span><br/>
                        <br/>
                        <Tab/><span className={"key-word"}>return</span> loss, accuracy
                    </span>
                </p>
                <p className={'mt-4'}>
                    <span className={'bold'}>
                        <span className={"key-word"}>with</span> exp.record(
                        <span className={"param"}>name</span>=<span className={"string"}>'sample'</span>,
                        <span className={"param"}> exp_conf</span>=conf):<br/>
                    </span>
                    <span>
                        <Tab/><span className={"key-word"}>for</span> i
                        <span className={"key-word"}> in</span> <span className={"built-ins"}>range</span>(
                        <span className={"value"}>100000</span>):<br/>
                    </span>
                    <span>
                       <Tab/><Tab/>lss, acc = train(i)<br/>
                    </span>
                    <span className={'bold'}>
                        <Tab/><Tab/>tracker.save(i, <span className={"param"}>loss</span>=lss,
                        <span className={"param"}> accuracy</span>=acc)
                    </span>
                </p>
            </code>
        </div>
        <Footer/>
    </div>
}
