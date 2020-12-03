import React, {useEffect, useRef, useState} from "react"

import {useHistory} from "react-router-dom"
import mixpanel from "mixpanel-browser"

import {BackButton, RefreshButton} from "../components/utils/util_buttons"
import {WarningMessage} from "../components/utils/alert"
import ConfigsCard from "../analyses/configs/card"
import {experiment_analyses} from "../analyses/all_analyses"
import RunHeaderCard from "../analyses/experiments/run_header/card"
import {Footer} from '../components/utils/footer'
import CACHE from "../cache/cache"
import useWindowDimensions from "../utils/window_dimensions"
import {Status} from "../models/status"
import {IsUserLogged} from "../models/user"


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const history = useHistory()

    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
    const statusCache = CACHE.getRunStatus(runUUID)
    const isUserLoggedCache = CACHE.getIsUserLogged()

    const [status, setStatus] = useState(null as unknown as Status)
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
    ]

    let lastUpdated: number = 0

    useEffect(() => {
        async function load() {
            for (let i = 0; i < experiment_analyses.length; i++) {
                if (refreshArray[i].current) {
                    refreshArray[i].current.load()
                }
            }

            SetIsLogged(await isUserLoggedCache.get())

            setStatus(await statusCache.get())
            if (status && !status.isRunning) {
                clearInterval(interval)
            }
        }

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    }, [status, refreshArray, statusCache, isUserLoggedCache])

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
        history.push('/home', uri)
    }

    return <div className={'run page'} style={{width: actualWidth}}>
        {isLogged && !isLogged.is_user_logged &&
        <WarningMessage onClick={onMessageClick}>
            <p>This Run may be lost in the future. Click here to add this to your experiments.</p>
        </WarningMessage>
        }
        <div className={'flex-container'}>
            <BackButton/>
            {status && status.isRunning && <RefreshButton onButtonClick={onRefresh}/>}
        </div>
        <RunHeaderCard uuid={runUUID} width={actualWidth} lastUpdated={lastUpdated}/>
        <ConfigsCard.Card uuid={runUUID} width={actualWidth}/>
        {experiment_analyses.map((analysis, i) => {
            return <analysis.card key={i} uuid={runUUID} width={actualWidth}
                                  refreshRef={refreshArray[i]}/>
        })}
        <Footer/>
    </div>
}

export default RunView