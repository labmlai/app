import React, {forwardRef, ReactElement, useEffect, useRef, useState} from "react"

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"

import {CardProps, ViewCardProps} from "../../types"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import CACHE from "../../../cache/cache"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {LabLoader} from "../../../components/utils/loader"
import {StatusView} from "../../../utils/status"
import {BackButton, CancelButton, EditButton, SaveButton} from "../../../components/utils/util_buttons"
import useWindowDimensions from "../../../utils/window_dimensions"

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
    isMainView?: boolean
}

function RunHeaderCard(props: RunHeaderProps) {
    const [run, setRun] = useState(null as unknown as Run)
    const [isClicked, setIsClicked] = useState(false)
    const [status, setStatus] = useState(null as unknown as Status)
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))

    const history = useHistory()

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
        if (props.isMainView) {
            history.push(`/run_header?uuid=${props.uuid}`, history.location.pathname)

        } else {
            setIsClicked(!isClicked)
        }
    }

    return <div onClick={onClick}>
        <RunView run={run} status={status} lastUpdated={lastUpdated} isClicked={isClicked}/>
    </div>
}

interface RunItemProps {
    item: string
    value: any
}

function RunItem(props: RunItemProps) {
    return <li>
        <span className={'item-key'}>
            {props.item}
        </span>
        <span className={'item-value'}>
             {props.value}
        </span>
    </li>
}

interface RunItemEditableProps {
    item: string
    value: any
    ref: any
}

function RunItemEditElem(props: RunItemEditableProps, ref: any) {
    return <li>
        <span className={'item-key'}>
            {props.item}
        </span>
        <div className={'input-container'}>
            <div className={'input-content'}>
                <input placeholder={props.value} ref={ref}/>
            </div>
        </div>
    </li>
}

let RunItemEditable = forwardRef(RunItemEditElem)

function RunHeaderView(props: ViewCardProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('uuid') as string

    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)
    const [isEditMode, setIsEditMode] = useState(false)

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

    const runNameElementRef = useRef(null) as any
    const commentElementRef = useRef(null) as any
    const noteElementRef = useRef(null) as any

    let items: ReactElement[] = []
    if (run && status) {
        const runItem = 'Run Name'
        let runNameElement = isEditMode ?
            <RunItemEditable key={1} item={runItem} value={run.name} ref={runNameElementRef}/>
            :
            <RunItem key={1} item={runItem} value={run.name}/>

        const commentItem = 'Comment Name'
        let commentElement = isEditMode ?
            <RunItemEditable key={2} item={commentItem} value={run.comment} ref={commentElementRef}/>
            :
            <RunItem key={2} item={commentItem} value={run.comment}/>

        const noteItem = 'Note'
        const noteValue = run.note ? run.note : 'write your note here'
        let noteElement = isEditMode ?
            <RunItemEditable key={3} item={noteItem} value={noteValue} ref={noteElementRef}/>
            :
            <RunItem key={3} item={noteItem} value={noteValue}/>

        items = [
            runNameElement,
            commentElement,
            noteElement,
            <RunItem key={4} item={'Run Status'} value={<StatusView status={status.run_status}/>}/>,
            <RunItem key={5} item={'UUID'} value={run.run_uuid}/>,
            <RunItem key={6} item={'Start Time'} value={formatTime(run.start_time)}/>,
            <RunItem key={7} item={'Last Recorded'}
                     value={status.isRunning ? getTimeDiff(status.last_updated_time) : formatTime(status.last_updated_time)}/>,
        ]
    }

    function UpdateRun() {
        if (runNameElementRef.current.value) {
            run.name = runNameElementRef.current.value
        }

        if (commentElementRef.current.value) {
            run.comment = commentElementRef.current.value
        }

        if (runNameElementRef.current.value) {
            run.name = runNameElementRef.current.value
        }

        runCache.setRun(run).then()
        onToggleEdit()
    }

    function onToggleEdit() {
        setIsEditMode(!isEditMode)
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton parent={props.title}/>
            {isEditMode && <CancelButton onButtonClick={onToggleEdit} parent={title}/>}
            {isEditMode && <SaveButton onButtonClick={UpdateRun} parent={title}/>}
            {!isEditMode && <EditButton onButtonClick={onToggleEdit} parent={title}/>}
        </div>
        <h2 className={'header text-center'}>{title}</h2>
        <div className={'list-container'}>
            {items.length > 0 ?
                <ul>
                    {items}
                </ul>
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