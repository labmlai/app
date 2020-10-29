import {ConfigsView} from "./components";
import React, {useCallback, useEffect, useState} from "react";
import {Run} from "../../models/run";
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom";
import useWindowDimensions from "../../utils/window_dimensions";
import {CardProps, ViewProps} from "../types";
import {LabLoader} from "../../components/loader";
import RunHeaderCard from "../run_header/card";
import {BackButton} from "../../components/back_button"
import {Alert} from "react-bootstrap";

function Card(props: CardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)
    const history = useHistory();

    useEffect(() => {
        async function load() {
            setRun(await runCache.getRun())
        }

        load().then()
            .catch((e) => {
                props.errorCallback(`${e}`)
            })
    })

    let configsView
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={props.width} isHyperParamOnly={true}/>
        if (run.configs.length === 0) {
            return null
        }
    } else {
        configsView = <LabLoader isLoading={true}/>
    }

    return <div>
        <div className={'labml-card labml-card-action'} onClick={
            () => {
                history.push(`/configs?run_uuid=${run.uuid}`, history.location.pathname);
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
    const [error, setError] = useState(null as (string | null))
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            setRun(await runCache.getRun())
        }

        load().then()
    })

    let configsView = null
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={actualWidth} isHyperParamOnly={false}/>
    } else {
        configsView = <LabLoader isLoading={true}/>
    }

    let errorCallback = useCallback((message: string) => {
        setError(message)
    }, [])

    let errorElem = null
    if (error != null) {
        errorElem = <Alert variant={'danger'}>{error}</Alert>
    }

    return <div className={'page'} style={{width: actualWidth}}>
        {errorElem}
        <BackButton/>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth} errorCallback={errorCallback}/>
        <h2 className={'header text-center'}>Configurations</h2>
        <div className={'labml-card'}>{configsView}</div>
    </div>
}

export default {
    Card,
    View
}