import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react"

import {useHistory} from "react-router-dom"
import mixpanel from "mixpanel-browser"

import {Analysis, SummaryCardProps, ViewCardProps} from "../../../types"
import {Run} from "../../../../models/run"
import CACHE from "../../../../cache/cache"
import {LabLoader} from "../../../../components/utils/loader"
import useWindowDimensions from "../../../../utils/window_dimensions"
import {BackButton, RefreshButton} from "../../../../components/utils/util_buttons"
import RunHeaderCard from "../../run_header/card"
import {Status} from "../../../../models/status"


const TITLE = 'Standard Output'
const URL = 'stdout'

function StdOut(props: SummaryCardProps, refreshRef: any) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)

    const history = useHistory()

    const Filter = require('../ansi_to_html.js')
    const f = new Filter({})

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        load().then()
    })

    async function onRefresh() {
        setRun(await runCache.get(true))
    }

    async function onLoad() {
        setRun(await runCache.get())
    }

    useImperativeHandle(refreshRef, () => ({
        refresh: () => {
            onRefresh().then()
        },
        load: () => {
            onLoad().then()
        },
        lastUpdated: runCache.lastUpdated,
    }))

    let stdOut: string[] = []
    if (run) {
        stdOut = run.stdout.slice(Math.max(run.stdout.length - 10, 0))
    }


    return <div>{!run ?
        <div className={'labml-card labml-card-action'}>
            <h3 className={'header'}>{TITLE}</h3>
            <LabLoader/>
        </div>
        : <div className={'labml-card labml-card-action'} onClick={
            () => {
                history.push(`/${URL}?uuid=${props.uuid}`, history.location.pathname)
            }
        }>
            <h3 className={'header'}>{TITLE}</h3>
            {stdOut.map((element, i) => {
                return <pre key={i} dangerouslySetInnerHTML={{__html: f.toHtml(element)}}/>
            })}
        </div>
    }
    </div>
}

function StdOutView(props: ViewCardProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('uuid') as string

    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)

    const runCache = CACHE.getRun(runUUID)
    const statusCache = CACHE.getRunStatus(runUUID)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    const Filter = require('../ansi_to_html.js')
    const f = new Filter({})

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
            setStatus(await statusCache.get())

            if (status && !status.isRunning) {
                clearInterval(interval)
            }
        }

        mixpanel.track('Analysis View', {uuid: runUUID, analysis: TITLE})

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    })

    async function load() {
        setRun(await runCache.get(true))
    }

    function onRefresh() {
        load().then()
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton/>
            {status && status.isRunning && <RefreshButton onButtonClick={onRefresh}/>}
        </div>
        <RunHeaderCard uuid={runUUID} width={actualWidth} lastUpdated={runCache.lastUpdated}/>
        <h2 className={'header text-center'}>{TITLE}</h2>
        {run && run.stdout.map((element, i) => {
            return <pre key={i} dangerouslySetInnerHTML={{__html: f.toHtml(element)}}/>
        })}
    </div>
}

let StdOutCard = forwardRef(StdOut)

let stdOutAnalysis: Analysis = {
    card: StdOutCard,
    view: StdOutView,
    route: `${URL}`
}

export default stdOutAnalysis
