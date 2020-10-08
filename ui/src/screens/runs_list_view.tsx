import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {RunsList} from "../components/runs_list"
import {Code} from "../components/code"
import {LabLoader} from "../components/loader"
import {RunListModel} from "../models/run"

interface RunsListProps {
    location: any
}

function RunsListView(props: RunsListProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<RunListModel[]>([])
    const [labMlToken, setLabMlToken] = useState('')

    const params = new URLSearchParams(props.location.search)

    useEffect(() => {
        NETWORK.get_runs(params.get('labml_token'))
            .then((res) => {
                if (res) {
                    setRuns(res.data.runs)
                    setLabMlToken(res.data.labml_token)
                    setIsLoading(false)
                }
            })
    }, [])

    useEffect(() => {
        document.title = "LabML: Runs list"
    }, [labMlToken])

    return <div>
        {(() => {
            if (isLoading) {
                return <LabLoader isLoading={isLoading}/>
            } else if (runs.length === 0) {
                return <Code labMlToken={labMlToken}/>
            } else {
                return <RunsList runs={runs}/>
            }
        })()}
    </div>
}

export default RunsListView