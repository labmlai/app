import {ConfigsView} from "./components";
import React, {useEffect, useState} from "react";
import {Run} from "../../models/run";
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom";
import useWindowDimensions from "../../utils/window_dimensions";
import {CardProps, ViewProps} from "../types";

function Card(props: CardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.get(props.uuid)
    const history = useHistory();

    useEffect(() => {
        async function load() {
            try {
                setRun(await runCache.getRun())
            } catch (e) {
            }
        }

        load().then()
    })

    let configsView = null
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={props.width} isHyperParamOnly={true}/>
        if (run.configs.length == 0) {
            return null
        }
    }

    return <div>
        <div className={'labml-card labml-card-action'} onClick={
            () => {
                history.push(`/configs?run_uuid=${run.uuid}`);
            }
        }>
            <h3>Configurations</h3>
            {configsView}
        </div>
    </div>
}

function View(props: ViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
    const runCache = CACHE.get(runUUID)
    let [run, setRun] = useState(null as unknown as Run)
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            try {
                setRun(await runCache.getRun())
            } catch (e) {
            }
        }

        load().then()
    })

    let configsView = null
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={actualWidth} isHyperParamOnly={false}/>
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <h3 className={'header'}>Configurations</h3>
        <div className={'labml-card'}>{configsView}</div>
    </div>
}

export default {
    Card,
    View
}