import {CardProps} from "../types";
import React, {useEffect, useState} from "react";
import {Run, Status} from "../../models/run";
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom";
import {formatTime, getTimeDiff} from "../../components/utils";
import {LabLoader} from "../../components/loader";
import {StatusView} from "../../components/status";
import "./style.scss"

function Card(props: CardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as (Status | null))
    const runCache = CACHE.get(props.uuid)
    const history = useHistory();

    useEffect(() => {
        async function load() {
            let status = await runCache.getStatus()
            setStatus(status)
            let run = await runCache.getRun()
            document.title = `LabML: ${run.name.trim()}`
            setRun(run)
            props.lastUpdatedCallback(getTimeDiff(status.last_updated_time))
        }

        load().then()
            .catch((e) => {
                props.errorCallback(`${e}`)
            })
    })

    useEffect(() => {
        async function loadStatus() {
            let status = await runCache.getStatus()
            setStatus(status)
            if (!status.isRunning) {
                clearInterval(interval)
            }
            props.lastUpdatedCallback(getTimeDiff(status.last_updated_time))
        }

        let interval = setInterval(loadStatus, 1000)
        return () => clearInterval(interval)
    })

    let runView = null
    if (run != null && status != null) {
        if (Object.keys(run).length === 0) {
            history.push(`/404`)
            return null
        }
        runView = <div>
            <div className={'run-info'}>
                <StatusView status={status.run_status} lastUpdatedTime={status.last_updated_time}/>
                <h3>{run.name}</h3>
                <h5>{run.comment}</h5>
                <div className={"run-uuid"}><span role={'img'} aria-label={'running'}>📌 UUID:</span>{props.uuid}</div>
                <div className={'start-time'}>Started {formatTime(run.start_time)}</div>
            </div>
        </div>
    } else {
        return <LabLoader isLoading={true}/>
    }

    return <div>
        <div className={'labml-card'}>
            {runView}
        </div>
    </div>
}

export default {
    Card
}