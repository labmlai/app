import React from "react";
import ReactMarkdown from "react-markdown";


interface MarkdownProps {
    labMlToken: string | null
}

export function Markdown(props: MarkdownProps) {
    const markdown = ` \`\`\`python
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

    return <div className={'ml-5'}>
        <h5>You don't have any experiments. Run the following code snippet to generate an experiment</h5>
        <ReactMarkdown  className={'mt-5'} source={markdown}/>
    </div>
}
