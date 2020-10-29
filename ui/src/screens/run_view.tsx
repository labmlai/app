import React, {useCallback, useEffect, useState} from "react"

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
import {Run} from "../models/run";
import CACHE from "../cache/cache";


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const [run, setRun] = useState(null as unknown as Run)
    const [error, setError] = useState(null as (string | null))
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))
    const {width: windowWidth} = useWindowDimensions()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const runCache = CACHE.getRun(runUUID)

    const actualWidth = Math.min(800, windowWidth)

    let errorCallback = useCallback((message: string) => {
        setError(message)
    }, [])

    let lastUpdatedCallback = useCallback((message: string) => {
        setLastUpdated(message)
    }, [])

    let errorElem = null
    if (error != null) {
        errorElem = <Alert variant={'danger'}>{error}</Alert>
    }

    let lastUpdatedElem = null
    if (lastUpdated != null) {
        lastUpdatedElem = <div className={'last-updated'}>Last updated {lastUpdated}</div>
    }

    useEffect(() => {
        async function load() {
            setRun(await runCache.getRun())
        }

        load().then()
    })

    return <div className={'run page'} style={{width: actualWidth}}>
        {errorElem}
        <BackButton/>
        {lastUpdatedElem}
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth}
                            errorCallback={errorCallback}
                            lastUpdatedCallback={lastUpdatedCallback}/>
        <ConfigsCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback}
                          lastUpdatedCallback={lastUpdatedCallback}/>
        <MetricsCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback}
                          lastUpdatedCallback={lastUpdatedCallback}/>
        {run && run.wildcard_indicators.grad &&
        <GradsCard.Card uuid={runUUID} width={actualWidth}
                        errorCallback={errorCallback}
                        lastUpdatedCallback={lastUpdatedCallback}/>
        }
        {run && run.wildcard_indicators.param &&
        <ParamsCard.Card uuid={runUUID} width={actualWidth}
                         errorCallback={errorCallback}
                         lastUpdatedCallback={lastUpdatedCallback}/>
        }
        {run && run.wildcard_indicators.module &&
        <ModulesCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback}
                          lastUpdatedCallback={lastUpdatedCallback}/>
        }
        {run && run.wildcard_indicators.time &&
        <TimesCard.Card uuid={runUUID} width={actualWidth}
                        errorCallback={errorCallback}
                        lastUpdatedCallback={lastUpdatedCallback}/>
        }
        <div className={'footer-copyright text-center'}>
            <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
            <span> | </span>
            <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
        </div>
    </div>
}

export default RunView