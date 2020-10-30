import React, {useCallback, useEffect, useState, useRef} from "react"

import {Button} from "react-bootstrap"

import "./run_view.scss"
import {BackButton} from "../components/back_button"
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/tracks/metrics/card"
import GradsCard from "../cards/tracks/grads/card"
import ParamsCard from "../cards/tracks/params/card"
import ModulesCard from "../cards/tracks/modules/card"
import TimesCard from "../cards/tracks/times/card"
import RunHeaderCard from "../cards/run_header/card"
import useWindowDimensions from "../utils/window_dimensions";
import {Alert} from "react-bootstrap";
import {Run, Status} from "../models/run";
import CACHE from "../cache/cache";


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)
    const [error, setError] = useState(null as (string | null))
    const {width: windowWidth} = useWindowDimensions()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
    const runCache = CACHE.getRun(runUUID)
    const actualWidth = Math.min(800, windowWidth)

    const timeRefreshRef = useRef(null) as any
    const metricRefreshRef = useRef(null) as any
    const gradRefreshRef = useRef(null) as any
    const paramRefreshRef = useRef(null) as any
    const moduleRefreshRef = useRef(null) as any

    let errorCallback = useCallback((message: string) => {
        setError(message)
    }, [])

    let errorElem = null
    if (error != null) {
        errorElem = <Alert variant={'danger'}>{error}</Alert>
    }

    useEffect(() => {
        async function load() {
            setRun(await runCache.getRun())
            setStatus(await runCache.getStatus())
        }

        load().then()
    })

    function onRefresh() {
        if (metricRefreshRef.current) {
            metricRefreshRef.current.refresh()
        }
        if (gradRefreshRef.current) {
            gradRefreshRef.current.refresh()
        }
        if (paramRefreshRef.current) {
            paramRefreshRef.current.refresh()
        }
        if (moduleRefreshRef.current) {
            moduleRefreshRef.current.refresh()
        }
        if (timeRefreshRef.current) {
            timeRefreshRef.current.refresh()
        }
    }


    return <div className={'run page'} style={{width: actualWidth}}>
        {errorElem}
        <BackButton/>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth}
                            errorCallback={errorCallback}/>
        {status && status.isRunning &&
        <Button className={'refresh'} onClick={onRefresh}>Refresh</Button>
        }
        <ConfigsCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback}/>
        <MetricsCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback} refreshRef={metricRefreshRef}/>
        {run && run.indicator_types.grad.length > 0 &&
        <GradsCard.Card uuid={runUUID} width={actualWidth}
                        errorCallback={errorCallback} refreshRef={gradRefreshRef}/>
        }
        {run && run.indicator_types.param.length > 0 &&
        <ParamsCard.Card uuid={runUUID} width={actualWidth}
                         errorCallback={errorCallback} refreshRef={paramRefreshRef}/>
        }
        {run && run.indicator_types.module.length > 0 &&
        <ModulesCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback} refreshRef={moduleRefreshRef}/>
        }
        {run && run.indicator_types.time.length > 0 &&
        <TimesCard.Card uuid={runUUID} width={actualWidth}
                        errorCallback={errorCallback} refreshRef={timeRefreshRef}/>
        }
        <div className={'footer-copyright text-center'}>
            <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
            <span> | </span>
            <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
        </div>
    </div>
}

export default RunView