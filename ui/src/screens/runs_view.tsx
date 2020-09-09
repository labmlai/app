import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {RunsTable} from "../components/runs_table"
import {Code} from "../components/code"
import {LabLoader} from "../components/loader"


interface RunsProps {
    location: any
}

function RunsView(props: RunsProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<any[]>([])

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
                return (
                    <LabLoader isLoading={isLoading}/>
                )
            } else if (runs.length === 0) {
                return (
                    <Code labMlToken={labMlToken}/>
                )
            } else {
                return (
                    <RunsTable runs={runs}/>
                )
            }
        })()}
    </div>
}

export default RunsView