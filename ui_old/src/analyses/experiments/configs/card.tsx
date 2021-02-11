import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react"

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"

import {ConfigsView} from "./components"
import {Run} from "../../../models/run"
import CACHE from "../../../cache/cache"
import useWindowDimensions from "../../../utils/window_dimensions"
import {Analysis, CardProps, SummaryCardProps, ViewProps} from "../../types"
import {LabLoader} from "../../../components/utils/loader"
import {RunHeaderCard} from "../run_header/card"
import {BackButton, RefreshButton} from "../../../components/utils/util_buttons"
import {Status} from "../../../models/status"


const URL = 'configs'

function Card(props: CardProps, ref: any) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)
    const history = useHistory()

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

    let configsView
    if (run !== null) {
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
                history.push(`/configs?uuid=${run.run_uuid}`, history.location.pathname);
            }
        }>
            <h3 className={'header'}>Configurations</h3>
            {configsView}
        </div>
    </div>
}

function ConfigsDetails(props: ViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('uuid') as string

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

const BasicConfigSummary = forwardRef(Card)

function ConfigSummary(props: SummaryCardProps) {
    return <BasicConfigSummary uuid={props.uuid}
                               ref={props.refreshRef}
                               width={props.width}/>
}


let ConfigsAnalysis: Analysis = {
    card: ConfigSummary,
    view: ConfigsDetails,
    route: `${URL}`
}

export default ConfigsAnalysis