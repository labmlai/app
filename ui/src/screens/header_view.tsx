import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {ConfigsView} from "../components/configs";

interface HeaderProps {
    location: any
}

function HeaderView(props: HeaderProps) {
    const [run, setRun] = useState({
        run_uuid: '',
        name: '',
        comment: '',
        configs: [],
    })

    const params = new URLSearchParams(props.location.search)
    const run_uuid = params.get('run_uuid')

    useEffect(() => {
        if (run_uuid) {
            NETWORK.get_run(run_uuid).then((res) => {
                setRun(res.data)
            })
        }
    }, [run_uuid])

    let runView = null
    if (run.configs.length !== 0) {
        runView = <div id={'run'} className={'run'} style={{width: '400px'}}>
            <h3>{run.name}</h3>
            <h4>{run.comment}</h4>
            <ConfigsView configs={run.configs} width={400}/>
        </div>
    }
    return <div>
        {runView}
    </div>

}

export default HeaderView