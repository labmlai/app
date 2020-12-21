import React, {ReactElement, useEffect, useState} from "react"

import mixpanel from "mixpanel-browser"

import {CardProps, ViewCardProps} from "../../types"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import CACHE from "../../../cache/cache"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {LabLoader} from "../../../components/utils/loader"
import {StatusView} from "../../../utils/status"
import {BackButton} from "../../../components/utils/util_buttons"
import useWindowDimensions from "../../../utils/window_dimensions"


import "./style.scss"
import "../../configs/style.scss"


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
    isMainView?: boolean
}

function RunHeaderCard(props: RunHeaderProps) {
    const [run, setRun] = useState(null as unknown as Run)
    const [isClicked, setIsClicked] = useState(false)
    const [status, setStatus] = useState(null as unknown as Status)
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))

    const runCache = CACHE.getRun(props.uuid)
    const statusCache = CACHE.getRunStatus(props.uuid)

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
    }, [props.lastUpdated, statusCache, runCache])

    useEffect(() => {
        async function loadStatus() {
            let status = await statusCache.get()
            setStatus(status)

            let lastUpdated = props.lastUpdated ? props.lastUpdated : statusCache.lastUpdated
            setLastUpdated(getTimeDiff(lastUpdated))
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        let interval = setInterval(loadStatus, 1000)
        return () => clearInterval(interval)
    }, [props.lastUpdated, statusCache])


    function onClick() {
        setIsClicked(!isClicked)
    }

    return <div onClick={onClick}>
        <RunView run={run} status={status} lastUpdated={lastUpdated} isClicked={isClicked}/>
    </div>
}

interface RunItemProps {
    item: string
    value: string | number
}

function HeaderItem(props: RunItemProps) {
    return <div className={'info_list config custom'}>
        <span className={'key text-dark font-weight-bold'}>
            {props.item}
        </span>
        <span className={'combined'}>
             {props.value}
        </span>
    </div>
}

function RunHeaderView(props: ViewCardProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('uuid') as string

    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)

    const runCache = CACHE.getRun(runUUID)
    const statusCache = CACHE.getRunStatus(runUUID)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    const title = 'Run Details'

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
            setStatus(await statusCache.get())
        }

        mixpanel.track('Analysis View', {uuid: runUUID, analysis: title})

        load().then()

    }, [runCache, statusCache, runUUID, props.title])

    let items: ReactElement[] = []
    if (run && status) {
        items = [
            <HeaderItem item={'Run Name'} value={run.name}/>,
            <HeaderItem item={'Comment'} value={run.comment}/>,
            <HeaderItem item={'Run UUID'} value={run.run_uuid}/>,
            <HeaderItem item={'Start Time'} value={run.start_time}/>,
            <HeaderItem item={'Run Status'} value={status.run_status.status}/>
        ]
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton parent={props.title}/>
        </div>
        <h2 className={'header text-center'}>{title}</h2>
        <div>
            {items.length > 0 ? <div className={"configs block collapsed"}>
                    {items}
                </div>
                :
                <LabLoader/>
            }
        </div>
    </div>

}

export {
    RunHeaderCard,
    RunHeaderView
}