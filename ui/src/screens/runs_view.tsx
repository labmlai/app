import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {RunsTable} from "../components/runs_table"
import {Markdown} from "../components/markdown"
import {Run} from "../components/utils"


interface RunsProps {
    location: any
}

function RunsView(props: RunsProps) {
    const [runs, setRuns] = useState<Run[]>([]);

    const params = new URLSearchParams(props.location.search)
    const labMlToken = params.get('labml_token')


    useEffect(() => {
        if (labMlToken) {
            NETWORK.get_runs(labMlToken).then((res) => {
                setRuns(res.data)
            })
        }
    }, [labMlToken])

    return <div className={'pt-5'}>
        {runs.length !== 0
            ? <RunsTable runs={runs}/>
            :
            <Markdown labMlToken={labMlToken}/>
        }
    </div>
}

export default RunsView