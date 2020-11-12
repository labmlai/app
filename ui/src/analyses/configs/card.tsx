import {ConfigsView} from "./components"
import React, {useEffect, useState} from "react"
import {Run} from "../../models/run"
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom"
import useWindowDimensions from "../../utils/window_dimensions"
import {CardProps, ViewProps} from "../types"
import {LabLoader} from "../../components/loader"
import RunHeaderCard from "../run_header/card"
import {BackButton} from "../../components/util_buttons"
import mixpanel from "mixpanel-browser"

function Card(props: CardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)
    const history = useHistory()

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        load().then()
    })

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
    let [run, setRun] = useState(null as unknown as Run)
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        mixpanel.track('Configs View', {uuid: runUUID});
        load().then()
    })

    let configsView = null
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={actualWidth} isHyperParamOnly={false}/>
    } else {
        configsView = <LabLoader/>
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton/>
        </div>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth}/>
        <h2 className={'header text-center'}>Configurations</h2>
        <div className={'labml-card'}>{configsView}</div>
    </div>
}

export default {
    Card,
    View
}