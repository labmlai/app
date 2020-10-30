import {CardProps} from "../types";
import React, {useEffect, useState} from "react";
import {Run, Status} from "../../models/run";
import CACHE from "../../cache/cache"
import {formatTime, getTimeDiff} from "../../components/utils";
import {LabLoader} from "../../components/loader";
import {StatusView} from "../../components/status";
import "./style.scss"

interface RunViewProps {
    run: Run
    status: Status
    lastUpdated: string | null
}

function RunView(props: RunViewProps) {
    let runView = null

    if (props.run != null && props.status != null && (!props.status.isRunning || props.lastUpdated != null)) {
        let lastRecorded = props.status.last_updated_time

        runView = <div>
            <div className={'last-updated'}>
                Last Recorded {props.status.isRunning ? getTimeDiff(lastRecorded * 1000) : formatTime(lastRecorded)}
            </div>
            <div className={'run-info'}>
                <StatusView status={props.status.run_status}/>
                <h3>{props.run.name}</h3>
                <h5>{props.run.comment}</h5>
                <div className={"run-uuid"}><span role={'img'} aria-label={'running'}>📌 UUID:</span>{props.run.uuid}
                </div>
                <div className={'start-time'}>Started {formatTime(props.run.start_time)}</div>
            </div>
            {
                props.status.isRunning &&
                <div className={'last-updated text-info'}>{props.lastUpdated}</div>
            }
        </div>
    } else {
        return <LabLoader/>
    }

    return <div className={'labml-card'}>
        {runView}
    </div>
}

function Card(props: CardProps) {
    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))
    const runCache = CACHE.getRun(props.uuid)

    useEffect(() => {
        async function load() {
            let status = await runCache.getStatus()
            setStatus(status)
            let run = await runCache.getRun()
            document.title = `LabML: ${run.name.trim()}`
            setRun(run)
            let lastUpdated = runCache.getLastUpdated()
            if (status && status.isRunning && lastUpdated > 0) {
                setLastUpdated(getTimeDiff(runCache.getLastUpdated()))
            }
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
            setLastUpdated(getTimeDiff(runCache.getLastUpdated()))
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        let interval = setInterval(loadStatus, 1000)
        return () => clearInterval(interval)
    })

    return <div>
        <RunView run={run} status={status} lastUpdated={lastUpdated}/>
    </div>
}

export default {
    Card
}