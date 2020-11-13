import React, {useEffect, useRef} from "react"

import mixpanel from "mixpanel-browser"

import {BackButton, RefreshButton} from "../components/util_buttons"
import ConfigsCard from "../analyses/configs/card"
import analyses from "../analyses/all_analyses"
import RunHeaderCard from "../analyses/run_header/card"
import CACHE from "../cache/cache"
import useWindowDimensions from "../utils/window_dimensions"

import "./run_view.scss"


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
    const statusCache = CACHE.getStatus(runUUID)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            onRefresh()
            let status = await statusCache.get()
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    })

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

    let lastUpdated: number = 0

    // call when load, 2 minutes interval and when refresh button clicks
    function onRefresh() {
        let oldest = (new Date()).getTime()

        for (let i = 0; i < analyses.length; i++) {
            if (refreshArray[i].current) {
                refreshArray[i].current.refresh()

                if (refreshArray[i].current.lastUpdated < oldest) {
                    oldest = refreshArray[i].current.lastUpdated
                }
            }
        }

        lastUpdated = oldest
    }

    return <div className={'run page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton/>
            <RefreshButton onButtonClick={onRefresh} runUUID={runUUID}/>
        </div>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth} lastUpdated={lastUpdated}/>
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