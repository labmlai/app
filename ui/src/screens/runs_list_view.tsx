import React, {useEffect, useState, useRef} from "react"

import {RunsList} from "../components/runs_list"
import {EmptyRunsList} from "../components/empty_runs_list"
import {LabLoader} from "../components/loader"
import {RunListItemModel} from "../models/run"
import CACHE from "../cache/cache";

import './runs_list_view.scss'


function RunsListView() {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<RunListItemModel[]>([])
    const [labMlToken, setLabMlToken] = useState('')

    const runListCache = CACHE.getRunsList()
    const inputElement = useRef(null) as any

    useEffect(() => {
        async function load() {
            let currentRunsList = await runListCache.getRunsList(null)
            if (currentRunsList) {
                setRuns(currentRunsList.runs)
                setLabMlToken(currentRunsList.labml_token)
                setIsLoading(false)
            }
        }

        load().then()
    }, [runListCache])


    useEffect(() => {
        document.title = "LabML: Home"
    }, [labMlToken])

    function runsFilter(run: RunListItemModel, search: string) {
        let re = new RegExp(search.toLowerCase(), "g")
        let name = run.name.toLowerCase()
        let comment = run.comment.toLowerCase()

        return (name.search(re) !== -1 || comment.search(re) !== -1)
    }

    const handleChannelChange = () => {
        async function load() {
            if (inputElement.current) {
                let search = inputElement.current.value
                let currentRunsList = await runListCache.getRunsList(null)
                let currentRuns = currentRunsList.runs

                currentRuns = currentRuns.filter((run) => runsFilter(run, search))
                setRuns(currentRuns)
            }
        }

        load().then()
    }

    return <div>
        {(() => {
            if (isLoading) {
                return <LabLoader/>
            } else if (inputElement.current === null && runs.length === 0) {
                return <EmptyRunsList/>
            } else {
                return <div className={'runs-list'}>
                    <input className={'mb-3 ml-3 mt-3'} ref={inputElement} onChange={handleChannelChange}
                           placeholder={'Search in Experiments'}/>
                    <RunsList runs={runs}/>
                </div>
            }
        })()}
    </div>
}

export default RunsListView