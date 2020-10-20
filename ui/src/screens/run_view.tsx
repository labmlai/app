import React, {useCallback, useState} from "react"

import "./run_view.scss"
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/tracks/metrics/card"
import GradsCard from "../cards/tracks/grads/card"
import ParamsCard from "../cards/tracks/params/card"
import RunHeaderCard from "../cards/run_header/card"
import useWindowDimensions from "../utils/window_dimensions";
import {Alert} from "react-bootstrap";


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const [error, setError] = useState(null as (string | null))
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))
    const {width: windowWidth} = useWindowDimensions()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
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

    return <div className={'run page'} style={{width: actualWidth}}>
        {errorElem}
        {lastUpdatedElem}
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth}
                            errorCallback={errorCallback} lastUpdatedCallback={lastUpdatedCallback}/>
        <ConfigsCard.Card uuid={runUUID} width={actualWidth}
                          errorCallback={errorCallback} lastUpdatedCallback={lastUpdatedCallback}/>
        <MetricsCard.Card uuid={runUUID} width={actualWidth}
                         errorCallback={errorCallback} lastUpdatedCallback={lastUpdatedCallback}/>
        <GradsCard.Card uuid={runUUID} width={actualWidth}
                       errorCallback={errorCallback} lastUpdatedCallback={lastUpdatedCallback}/>
        <ParamsCard.Card uuid={runUUID} width={actualWidth}
                        errorCallback={errorCallback} lastUpdatedCallback={lastUpdatedCallback}/>
        <div className={'footer-copyright text-center'}>
            <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
            <span> | </span>
            <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
        </div>
    </div>
}

export default RunView