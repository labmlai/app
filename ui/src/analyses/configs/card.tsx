import React, {useEffect, useState} from "react"

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"

import {ConfigsView} from "./components"
import {Run} from "../../models/run"
import CACHE from "../../cache/cache"
import useWindowDimensions from "../../utils/window_dimensions"
import {CardProps, ViewProps} from "../types"
import {LabLoader} from "../../components/utils/loader"
import {RunHeaderCard} from "../experiments/run_header/card"
import {BackButton, RefreshButton} from "../../components/utils/util_buttons"
import {Status} from "../../models/status"


function Card(props: CardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)
    const history = useHistory()

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        load().then()
    }, [runCache])

    let configsView
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={props.width} isHyperParamOnly={true}/>
        if (run.configs.length === 0) {
            return null
        }
    } else {
        configsView = <LabLoader/>
    }

    return <div>
        <div className={'labml-card labml-card-action'} onClick={
            () => {
                history.push(`/configs?run_uuid=${run.run_uuid}`, history.location.pathname);
            }
        }>
            <h3 className={'header'}>Configurations</h3>
            {configsView}
        </div>
    </div>
}

function View(props: ViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const runCache = CACHE.getRun(runUUID)
    const statusCache = CACHE.getRunStatus(runUUID)

    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
            setStatus(await statusCache.get())

            if (status && !status.isRunning) {
                clearInterval(interval)
            }
        }

        mixpanel.track('Configs View', {uuid: runUUID})

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    }, [runCache, status, statusCache, runUUID])

    let configsView
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={actualWidth} isHyperParamOnly={false}/>
    } else {
        configsView = <LabLoader/>
    }

    async function load() {
        setRun(await runCache.get(true))
    }

    function onRefresh() {
        load().then()
    }

    const title = 'Configs View'

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton parent={title}/>
            {status && status.isRunning && <RefreshButton onButtonClick={onRefresh} parent={title}/>}
        </div>
        <RunHeaderCard uuid={runUUID} width={actualWidth}/>
        <h2 className={'header text-center'}>Configurations</h2>
        <div className={'labml-card'}>{configsView}</div>
    </div>
}

export default {
    Card,
    View
}