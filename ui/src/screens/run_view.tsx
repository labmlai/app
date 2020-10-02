import React, {useCallback, useState} from "react"

import "./run_view.scss"
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/metrics/card"
import RunHeaderCard from "../cards/run_header/card"
import useWindowDimensions from "../utils/window_dimensions";
import {Alert} from "react-bootstrap";
import {Run} from "../models/run";


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const [error, setError] = useState(null as unknown as string)
    const {width: windowWidth} = useWindowDimensions()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
    const actualWidth = Math.min(800, windowWidth)

    let errorCallback = useCallback((message: string) => {
        setError(message)
    }, [error])

    let errorElem = null
    if (error != null) {
        errorElem =  <Alert variant={'danger'}>{error}</Alert>
    }

    return <div className={'run page'} style={{width: actualWidth}}>
        {errorElem}
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth} errorCallback={errorCallback}/>
        <ConfigsCard.Card uuid={runUUID} width={actualWidth} errorCallback={errorCallback}/>
        <MetricsCard.Card uuid={runUUID} width={actualWidth} errorCallback={errorCallback}/>
        <div className={'footer-copyright text-center'}>
            <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
            <span> | </span>
            <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
        </div>
    </div>
}

export default RunView