import React from "react";
import {LabLoader} from "./loader"
import Highlight from 'react-highlight.js'


interface CodeProps {
    labMlToken: string | null
}

export function Code(props: CodeProps) {
    const code =
    `    
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
    `

    return <div>
        <LabLoader isLoading={true}/>
        <p className={'text-center text-secondary mt-5'}>We have nothing to show. Run the below code snippet to
            generate a sample experiment.</p>
        <div className={"w-75 mx-auto mt-4"}>
            <Highlight language={'python'}>
                {code}
            </Highlight>
        </div>
    </div>
}
