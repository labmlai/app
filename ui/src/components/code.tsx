import React from "react";

import "./code.scss"

function Tab() {
    return <span>
        &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
}

function HalfTab() {
    return <span>
        &nbsp;&nbsp;
    </span>
}

export function PyTorchCode() {
    return <div className={'code-sample bg-dark px-1 py-2 my-3'}>
        <pre className={"text-white"}>
            <div>
                <span className={"key-word"}>from</span> numpy.random
                <span className={"key-word"}> import</span> random
            </div>
            <div>
                <span className={"key-word"}>from</span> labml <span className={"key-word"}>import</span>
                <span> tracker, experiment </span><span className={"key-word"}>as</span> exp
            </div>
            <br/>

            <div>
            conf = {"{"}<span className={"string"}>'batch_size'</span>: <span className={"value"}>20</span>{"}"}<br/>
            </div>
            <br/>

            <div>
                <span className={"key-word"}>def</span>  <span className={"method"}>train</span>(n:
                <span className={"built-ins"}>int</span>):
            </div>
            <div>
                <Tab/>loss = <span className={"value"}>0.999</span>
                <span> ** n + random() / </span><span className={"value"}>10</span>
            </div>
            <div>
                <Tab/>accuracy = <span className={"value"}>1</span> - <span className={"value"}>0.999</span>
                <span> ** n + random() / </span>
                <span className={"value"}>10</span>
            </div>
            <br/>

            <div>
                <Tab/><span className={"key-word"}>return</span> loss, accuracy
            </div>
            <br/>
            
            <div className={'labml-api'}>
                <span className={"key-word"}>with</span> exp.record(
                <span className={"param"}>name</span>=<span className={"string"}>'sample'</span>,
                <span className={"param"}> exp_conf</span>=conf):
            </div>

            <div>
                <Tab/><span className={"key-word"}>for</span> i
                <span className={"key-word"}> in</span> <span className={"built-ins"}>range</span>(
                <span className={"value"}>100000</span>):
            </div>
            <div><Tab/><Tab/>lss, acc = train(i)</div>
            <div className={'labml-api'}>
                <Tab/><Tab/>tracker.save(i, <span className={"param"}>loss</span>=lss,
                <span className={"param"}> accuracy</span>=acc)
            </div>
        </pre>
    </div>
}

export function KerasCode() {
    return <div className={'code-sample bg-dark px-1 py-2 my-3'}>
        <pre className={"text-white"}>
             <div>
                <span className={"key-word"}>from</span> labml <span className={"key-word"}>import</span>
                <span> experiment </span><span className={"key-word"}>as</span> exp
            </div>
            <div>
                <span className={"key-word"}>from</span> labml.utils.keras <span className={"key-word"}>import</span>
                <span> LabMLKerasCallback </span>
            </div>
             <br/>
            <div className={'labml-api'}>
                <span className={"key-word"}>with</span> exp.record(
                <span className={"param"}>name</span>=<span className={"string"}>'sample'</span>,
                <span className={"param"}> exp_conf</span>=conf):
            </div>
            <div>
                <Tab/><span className={"key-word"}>for</span> i
                <span className={"key-word"}> in</span> <span className={"built-ins"}>range</span>(
                <span className={"value"}>50</span>):
            </div>
            <div><Tab/><Tab/>model.fit(x_train,</div>
             <div><Tab/><Tab/><Tab/><Tab/><HalfTab/>y_train,</div>
             <div>
                <Tab/><Tab/><Tab/><Tab/><HalfTab/><span className={"param"}>epochs</span>=conf[<span
                 className={"string"}>'epochs'</span>],
            </div>
            <div>
                <Tab/><Tab/><Tab/><Tab/><HalfTab/><span className={"param"}>validation_data</span>=(x_test, y_test),
            </div>
             <div className={'labml-api'}>
                <Tab/><Tab/><Tab/><Tab/><HalfTab/><span className={"param"}>callbacks</span>=[LabMLKerasCallback()],
            </div>
            <div>
                <Tab/><Tab/><Tab/><Tab/><HalfTab/><span className={"param"}>verbose</span>=<span
                className={"key-word"}>None</span>)
            </div>
        </pre>
    </div>

}
