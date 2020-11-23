import React, {useEffect, useState} from "react"

import {CardProps} from "../types"
import {Run} from "../../models/run"
import {Status} from "../../models/status"
import CACHE from "../../cache/cache"
import {formatTime, getTimeDiff} from "../../utils/time"
import {LabLoader} from "../../components/loader"
import {StatusView} from "../../utils/status"

import "./style.scss"

interface RunViewProps {
    run: Run
    status: Status
    lastUpdated: string | null
    isClicked: boolean
}

function RunView(props: RunViewProps) {
    let runView = null

    if (props.run != null && props.status != null && (!props.status.isRunning || props.lastUpdated != null)) {
        let lastRecorded = props.status.last_updated_time

        runView = <div>
            <div className={'last-updated mb-2'}>
                Last Recorded {props.status.isRunning ? getTimeDiff(lastRecorded * 1000) : formatTime(lastRecorded)}
            </div>
            <div className={'run-info'}>
                <StatusView status={props.status.run_status}/>
                <h3>{props.run.name}</h3>
                <h5>{props.run.comment}</h5>
                {props.isClicked &&
                <div>
                    <div className={"run-uuid"}>
                        <span role={'img'} aria-label={'running'}>📌 UUID:</span>{props.run.run_uuid}
                    </div>
                    <div className={'start-time'}>Started {formatTime(props.run.start_time)}</div>
                </div>
                }
            </div>
            {
                props.status.isRunning &&
                <div className={'last-updated text-info'}>{props.lastUpdated}</div>
            }
        </div>
    } else {
        return <LabLoader/>
    }

    let className = 'labml-card labml-card-action'
    if (props.isClicked) {
        className += ' selected'
    }

    return <div className={className}>
        {runView}
    </div>
}

interface RunHeaderProps extends CardProps {
    lastUpdated?: number
}

function Card(props: RunHeaderProps) {
    const [run, setRun] = useState(null as unknown as Run)
    const [isClicked, setIsClicked] = useState(false)
    const [status, setStatus] = useState(null as unknown as Status)
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))

    const runCache = CACHE.getRun(props.uuid)
    const statusCache = CACHE.getStatus(props.uuid)

    useEffect(() => {
        async function load() {
            let status = await statusCache.get()
            setStatus(status)
            let run = await runCache.get()
            document.title = `LabML: ${run.name.trim()}`
            setRun(run)
            // TODO change this based on discussion
            let lastUpdated = props.lastUpdated ? props.lastUpdated : statusCache.lastUpdated
            if (status && status.isRunning && lastUpdated > 0) {
                setLastUpdated(getTimeDiff(lastUpdated))
            }
        }

        load().then()
    })

    useEffect(() => {
        async function loadStatus() {
            let status = await statusCache.get()
            setStatus(status)
            // TODO change this based on discussion
            let lastUpdated = props.lastUpdated ? props.lastUpdated : statusCache.lastUpdated
            setLastUpdated(getTimeDiff(lastUpdated))
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        let interval = setInterval(loadStatus, 1000)
        return () => clearInterval(interval)
    })


    function onClick() {
        setIsClicked(!isClicked)
    }

    return <div onClick={onClick}>
        <RunView run={run} status={status} lastUpdated={lastUpdated} isClicked={isClicked}/>
    </div>
}

export default {
    Card
}