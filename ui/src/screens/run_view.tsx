import React, {useEffect, useRef} from "react"

import {BackButton, RefreshButton} from "../components/util_buttons"
import ConfigsCard from "../cards/configs/card"
import analyses from "../cards/analyses/all_analyses"
import RunHeaderCard from "../cards/run_header/card"
import useWindowDimensions from "../utils/window_dimensions"

import "./run_view.scss"
import mixpanel from "mixpanel-browser";


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const {width: windowWidth} = useWindowDimensions()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        mixpanel.track('Run View', {uuid: runUUID});
    }, [runUUID])

    //TODO should create from a loop
    let refreshArray: any[] = [
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
    ]

    function onRefresh() {
        for (let i = 0; i < analyses.length; i++) {
            if (refreshArray[i].current) {
                refreshArray[i].current.refresh()
            }
        }
    }

    return <div className={'run page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton/>
            <RefreshButton onButtonClick={onRefresh} runUUID={runUUID}/>
        </div>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth}/>
        <ConfigsCard.Card uuid={runUUID} width={actualWidth}/>
        {analyses.map((analysis, i) => {
            return <analysis.card key={i} uuid={runUUID} width={actualWidth}
                                  refreshRef={refreshArray[i]}/>
        })}
        <div className={'footer-copyright text-center'}>
            <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
            <span> | </span>
            <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
        </div>
    </div>
}

export default RunView