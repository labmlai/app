import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {RunsList} from "../components/runs_list"
import {Code} from "../components/code"
import {LabLoader} from "../components/loader"
import {Run} from "../components/models"


interface RunsListProps {
    location: any
}

function RunsListView(props: RunsListProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<Run[]>([])

    const params = new URLSearchParams(props.location.search)
    const labMlToken = params.get('labml_token')


    useEffect(() => {
        if (labMlToken) {
            NETWORK.get_runs(labMlToken).then((res) => {
                if (res) {
                    setRuns(res.data)
                    setIsLoading(false)
                }
            })
        }
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