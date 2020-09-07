import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {RunsTable} from "../components/runs_table";
import {Run} from "../components/utils";


interface RunsProps {
    location: any
}

function RunsView(props: RunsProps) {
    const [runs, setRuns] = useState<Run[]>([]);

    const params = new URLSearchParams(props.location.search)
    const labml_token = params.get('labml_token')

    useEffect(() => {
        if (labml_token) {
            NETWORK.get_runs(labml_token).then((res) => {
                setRuns(res.data)
            })
        }
    }, [labml_token])

    return <div className={'pt-5'}>
        <RunsTable runs={runs}/>
    </div>

}

export default RunsView