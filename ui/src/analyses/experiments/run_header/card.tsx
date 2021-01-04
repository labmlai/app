import React, {forwardRef, ReactElement, useEffect, useRef, useState} from "react"

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"

import {CardProps, ViewCardProps} from "../../types"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import CACHE from "../../../cache/cache"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {LabLoader} from "../../../components/utils/loader"
import {StatusView, BadgeView} from "../../../utils/status"
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

interface RunItemEditableProps {
    item: string
    value: any
    placeholder?: string
    ref: any
    isEditable?: boolean
}

function InputElem(props: RunItemEditableProps, ref: any) {
    return <li>
            <span className={'item-key'}>
            {props.item}
        </span>
        {props.isEditable ?
            <div className={'input-container mt-2'}>
                <div className={'input-content'}>
                    <input defaultValue={props.value} ref={ref} placeholder={props.placeholder}/>
                </div>
            </div>
            :
            <span className={'item-value'}>
             {props.value}
        </span>
        }
    </li>
}

let InputEditable = forwardRef(InputElem)

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
        items = [
            <InputEditable key={1} item={'Run Name'} value={run.name} ref={runNameElementRef} isEditable={isEditMode}/>,
            <InputEditable key={2} item={'Comment'} value={run.comment} ref={commentElementRef}
                           isEditable={isEditMode}/>,
            <InputEditable key={13} item={'Tags'}
                           value={
                               <div>
                                   {run.tags.map((tag, idx) => (
                                       <BadgeView text={tag}/>
                                   ))}
                               </div>
                           }
            />,
            <InputEditable key={3} item={'Note'} value={run.note} placeholder={'write your note here'}
                           ref={noteElementRef} isEditable={isEditMode}/>,
            <InputEditable key={4} item={'Run Status'} value={<StatusView status={status.run_status}/>}/>,
            <InputEditable key={5} item={'UUID'} value={run.run_uuid}/>,
            <InputEditable key={6} item={'Start Time'} value={formatTime(run.start_time)}/>,
            <InputEditable key={7} item={'Last Recorded'}
                           value={status.isRunning ? getTimeDiff(status.last_updated_time * 1000) : formatTime(status.last_updated_time)}/>,
            <InputEditable key={8} item={'Start Step'} value={run.start_step}/>,
            <InputEditable key={9} item={'Python File'} value={run.python_file}/>,
            <InputEditable key={10} item={'Remote Repo'} value={<a href={run.repo_remotes}>{run.repo_remotes}</a>}/>,
            <InputEditable key={11} item={'Commit'} value={run.commit}/>,
            <InputEditable key={12} item={'Commit Message'} value={run.commit_message}/>,
        ]
    }

    function UpdateRun() {
        if (runNameElementRef.current.value) {
            run.name = runNameElementRef.current.value
        }

        if (commentElementRef.current.value) {
            run.comment = commentElementRef.current.value
        }

        if (noteElementRef.current.value) {
            run.note = noteElementRef.current.value
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