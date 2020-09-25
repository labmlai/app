import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {RunsList} from "../components/runs_list"
import {Code} from "../components/code"
import {LabLoader} from "../components/loader"
import {Run} from "../components/models"


function RunsListView() {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<Run[]>([])
    const [labMlToken, setLabMlToken] = useState('')

    useEffect(() => {
        NETWORK.get_runs()
            .then((res) => {
                if (res) {
                    setRuns(res.data.runs)
                    setLabMlToken(res.data.labml_token)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                console.log(err)
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