import React, {useEffect, useRef, useState} from "react"

import {useHistory} from "react-router-dom"
import mixpanel from "mixpanel-browser"

import {BackButton, RefreshButton} from "../components/utils/util_buttons"
import {WarningMessage} from "../components/utils/alert"
import ConfigsCard from "../analyses/configs/card"
import {experiment_analyses} from "../analyses/all_analyses"
import {RunHeaderCard} from "../analyses/experiments/run_header/card"
import {Footer} from '../components/utils/footer'
import CACHE from "../cache/cache"
import useWindowDimensions from "../utils/window_dimensions"
import {Status} from "../models/status"
import {IsUserLogged} from "../models/user"
import {Run} from "../models/run"


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const history = useHistory()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const statusCache = CACHE.getRunStatus(runUUID)
    const runCache = CACHE.getRun(runUUID)
    const isUserLoggedCache = CACHE.getIsUserLogged()

    const [status, setStatus] = useState(null as unknown as Status)
    const [run, setRun] = useState(null as unknown as Run)
    const [isLogged, SetIsLogged] = useState(null as unknown as IsUserLogged)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    //TODO should create from a loop
    let refreshArray: any[] = [
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
        useRef(null) as any,
    ]

    let lastUpdated: number = 0

    useEffect(() => {
        async function load() {
            for (let i = 0; i < experiment_analyses.length; i++) {
                if (refreshArray[i].current) {
                    refreshArray[i].current.load()
                }
            }

            setStatus(await statusCache.get())
            if (status && !status.isRunning) {
                clearInterval(interval)
            }
        }

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    }, [status, refreshArray, statusCache])

    useEffect(() => {
        async function load() {
            SetIsLogged(await isUserLoggedCache.get())
            setRun(await runCache.get())
        }

        load().then()
    }, [isUserLoggedCache, runCache])

    useEffect(() => {
        mixpanel.track('Run View', {uuid: runUUID})
    }, [runUUID])

    // call when load, 2 minutes interval and when refresh button clicks
    function onRefresh() {
        let oldest = (new Date()).getTime()

        for (let i = 0; i < experiment_analyses.length; i++) {
            if (refreshArray[i].current) {
                refreshArray[i].current.refresh()

                if (refreshArray[i].current.lastUpdated < oldest) {
                    oldest = refreshArray[i].current.lastUpdated
                }
            }
        }

        lastUpdated = oldest
    }

    function onMessageClick() {
        let uri = props.location.pathname + props.location.search
        history.push('/runs', uri)
    }

    return <div className={'run page'} style={{width: actualWidth}}>
        {isLogged && !isLogged.is_user_logged && run && !run.is_claimed &&
        <WarningMessage onClick={onMessageClick}>
            <p>This run will be deleted in 12 hours. Click here to add it to your experiments.</p>
        </WarningMessage>
        }
        <div className={'flex-container'}>
            <BackButton parent={'Run View'}/>
            {status && status.isRunning && <RefreshButton onButtonClick={onRefresh} parent={'Run View'}/>}
        </div>
        <RunHeaderCard uuid={runUUID} width={actualWidth} lastUpdated={lastUpdated} isMainView={true}/>
        <ConfigsCard.Card uuid={runUUID} width={actualWidth}/>
        {experiment_analyses.map((analysis, i) => {
            return <analysis.card key={i} uuid={runUUID} width={actualWidth}
                                  refreshRef={refreshArray[i]}/>
        })}
        <Footer/>
    </div>
}

export default RunView