import React, {forwardRef, useEffect, useImperativeHandle, useState, useRef} from "react"

import {useHistory} from "react-router-dom"
import mixpanel from "mixpanel-browser"

import {BasicProps, CardProps, ViewCardProps} from "../../analyses/types"
import {Run} from "../../models/run"
import CACHE from "../../cache/cache"
import {LabLoader} from "../utils/loader"
import useWindowDimensions from "../../utils/window_dimensions"
import {BackButton, RefreshButton} from "../utils/util_buttons"
import {RunHeaderCard} from "../../analyses/experiments/run_header/card"
import {Status} from "../../models/status"
import Filter from "./ansi_to_html"

import "./terminal.scss"


interface StdOutCardProps extends BasicProps, CardProps {
    url: string
    type: 'stdout' | 'logger' | 'stderr'
}

function StdOut(props: StdOutCardProps, ref: any) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)

    const history = useHistory()

    const f = new Filter({})

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        load().then()
    }, [runCache])

    async function onRefresh() {
        setRun(await runCache.get(true))
    }

    async function onLoad() {
        setRun(await runCache.get())
    }

    useImperativeHandle(ref, () => ({
        refresh: () => {
            onRefresh().then()
        },
        load: () => {
            onLoad().then()
        },
        lastUpdated: runCache.lastUpdated,
    }))

    const terminalRef = useRef(null) as any

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = Number.MAX_SAFE_INTEGER
        }
    }, [terminalRef])


    return <div>{!run ?
        <div className={'labml-card labml-card-action'}>
            <h3 className={'header'}>{props.title}</h3>
            <LabLoader/>
        </div>
        : run && run[props.type] ? <div className={'labml-card labml-card-action'} onClick={
                () => {
                    history.push(`/${props.url}?uuid=${props.uuid}`, history.location.pathname)
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                <div className={'terminal-card no-scroll'} ref={terminalRef}>
                    {run && <pre dangerouslySetInnerHTML={{__html: f.toHtml(run[props.type])}}/>}
                </div>
            </div>
            : <div/>
    }
    </div>
}

interface StdOutViewCardProps extends ViewCardProps {
    type: 'stdout' | 'logger' | 'stderr'
}

function StdOutView(props: StdOutViewCardProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('uuid') as string

    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)

    const runCache = CACHE.getRun(runUUID)
    const statusCache = CACHE.getRunStatus(runUUID)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    const f = new Filter({})

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())

            let currentStatus = await statusCache.get()
            if (currentStatus && !currentStatus.isRunning) {
                clearInterval(interval)
            }

            setStatus(currentStatus)
        }

        mixpanel.track('Analysis View', {uuid: runUUID, analysis: props.title})

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    }, [runCache, statusCache, runUUID, props.title])

    async function load() {
        setRun(await runCache.get(true))
    }

    function onRefresh() {
        load().then()
    }

    return <div className={'page'}>
        <div className={'flex-container'}>
            <BackButton parent={props.title}/>
            {status && status.isRunning && <RefreshButton onButtonClick={onRefresh} parent={props.title}/>}
        </div>
        <RunHeaderCard uuid={runUUID} width={actualWidth} lastUpdated={runCache.lastUpdated}/>
        <h2 className={'header text-center'}>{props.title}</h2>
        <div className={'terminal-card'}>
            {run ? <pre dangerouslySetInnerHTML={{__html: f.toHtml(run[props.type])}}/>
                :
                <LabLoader/>
            }
        </div>
    </div>
}

let StdOutCard = forwardRef(StdOut)

export {
    StdOutCard,
    StdOutView
}

