import React, {useEffect, useState} from "react"

import {RunsList} from "../components/runs_list"
import {Code} from "../components/code"
import {LabLoader} from "../components/loader"
import {RunListItemModel} from "../models/run"
import CACHE from "../cache/cache";

interface RunsListProps {
    location: any
}

function RunsListView(props: RunsListProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<RunListItemModel[]>([])
    const [labMlToken, setLabMlToken] = useState('')

    const params = new URLSearchParams(props.location.search)

    useEffect(() => {
        const runListCache = CACHE.getRunsList()

        async function load() {
            let currentRunsList = await runListCache.getRunsList(params.get('labml_token'))
            if (currentRunsList) {
                setRuns(currentRunsList.runs)
                setLabMlToken(currentRunsList.labml_token)
                setIsLoading(false)
            }
        }

        load().then()
    }, [params])

    useEffect(() => {
        document.title = "LabML: Home"
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