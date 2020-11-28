import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react"

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"

import {getChart, getSparkLines} from "./components"
import {BarLines} from "./barline"
import {SeriesModel} from "../../models/run"
import useWindowDimensions from "../../utils/window_dimensions"
import RunHeaderCard from "../../analyses/run_header/card"
import CACHE from "../../cache/cache"
import {LabLoader} from "../loader"
import {BackButton, RefreshButton, SaveButton} from "../util_buttons"
import {BasicProps, CardProps, ViewProps} from "../../analyses/types"


import "./style.scss"


interface BasicCardProps extends BasicProps, CardProps {
    isChartView: boolean
    url: string
}

function SparkLinesCard(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as (SeriesModel[] | null))
    const analysisCache = props.cache.getAnalysis(props.uuid)
    const history = useHistory()

    async function onRefresh() {
        setTrack(await analysisCache.get(true))
    }

    async function onLoad() {
        setTrack(await analysisCache.get())
    }

    useImperativeHandle(ref, () => ({
        refresh: () => {
            onRefresh().then()
        },
        load: () => {
            onLoad().then()
        },
        lastUpdated: analysisCache.lastUpdated,
    }))

    return <div>{!track ?
        <div className={'labml-card labml-card-action'}>
            <h3 className={'header'}>{props.title}</h3>
            <LabLoader/>
        </div>
        : track && track.length > 0 ?
            <div className={'labml-card labml-card-action'} onClick={
                () => {
                    history.push(`/${props.url}?run_uuid=${props.uuid}`, history.location.pathname);
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                {props.isChartView && getChart('normal', track, null, props.width)}
                {getSparkLines('normal', track, null, props.width)}
            </div>
            : <div/>
    }
    </div>
}

function BarLinesCard(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as (SeriesModel[] | null))
    const analysisCache = props.cache.getAnalysis(props.uuid)
    const history = useHistory()

    async function onRefresh() {
        setTrack(await analysisCache.get(true))
    }

    async function onLoad() {
        setTrack(await analysisCache.get())
    }

    useImperativeHandle(ref, () => ({
        refresh: () => {
            onRefresh().then()
        },
        load: () => {
            onLoad().then()
        },
        lastUpdated: analysisCache.lastUpdated
    }))

    return <div>{!track ?
        <div className={'labml-card labml-card-action'}>
            <h3 className={'header'}>{props.title}</h3>
            <LabLoader/>
        </div>
        : track && track.length > 0 ?
            <div className={'labml-card labml-card-action'} onClick={
                () => {
                    history.push(`/${props.url}?run_uuid=${props.uuid}`, history.location.pathname);
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                <BarLines width={props.width} series={track}/>
            </div>
            : <div/>
    }
    </div>
}


interface BasicViewProps extends BasicProps, ViewProps {

}

function BasicView(props: BasicViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const statusCache = CACHE.getStatus(runUUID)
    const analysisCache = props.cache.getAnalysis(runUUID)
    const preferenceCache = props.cache.getPreferences(runUUID)

    const [track, setTrack] = useState(null as unknown as SeriesModel[])
    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const [currentChart, setCurrentChart] = useState(0)
    const [isDisabled, setIsDisabled] = useState(true)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    let preference = useRef(null) as any

    useEffect(() => {
        async function load() {
            setTrack(await analysisCache.get())
            let status = await statusCache.get()
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        mixpanel.track('Analysis View', {uuid: runUUID, analysis: props.title})

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    })

    useEffect(() => {
        async function load() {
            preference.current = await preferenceCache.get()

            if (preference.current) {
                let analysis_preferences = preference.current.series_preferences
                if (analysis_preferences.length > 0) {
                    setPlotIdx(analysis_preferences)
                } else if (track) {
                    let res: number[] = []
                    for (let i = 0; i < track.length; i++) {
                        res.push(i)
                    }
                    setPlotIdx(res)
                }
            }
        }

        load().then()
    }, [track, preference, preferenceCache])

    function updatePreferences() {
        if (preference.current) {
            preferenceCache.setPreference(preference.current).then()
            setIsDisabled(true)
        }
    }

    async function load() {
        setTrack(await analysisCache.get(true))
    }

    function onRefresh() {
        load().then()
    }

    let toggleChart = useCallback((idx: number) => {
        setIsDisabled(false)

        if (plotIdx[idx] >= 0) {
            plotIdx[idx] = -1
        } else {
            plotIdx[idx] = Math.max(...plotIdx) + 1
        }

        if (plotIdx.length > 1) {
            setPlotIdx(new Array<number>(...plotIdx))
            preference.current.series_preferences = plotIdx
        }
    }, [plotIdx, preference])

    function onChartClick() {
        if (currentChart === 1) {
            setCurrentChart(0)
        } else {
            setCurrentChart(currentChart + 1)
        }
    }

    function getChartType(index: number): 'log' | 'normal' {
        return index === 0 ? 'normal' : 'log'
    }

    let dots: JSX.Element[] = []
    for (let i = 0; i < 2; i++) {
        if (i === currentChart) {
            dots.push(<span key={i} className={"dot color-dot"}/>)
        } else {
            dots.push(<span key={i} className={"dot"}/>)
        }
    }

    let chart = getChart(getChartType(currentChart), track, plotIdx, actualWidth, toggleChart)
    let sparkLines = getSparkLines(getChartType(currentChart), track, plotIdx, actualWidth, toggleChart)

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton/>
            <SaveButton onButtonClick={updatePreferences} isDisabled={isDisabled}/>
            <RefreshButton onButtonClick={onRefresh} runUUID={runUUID}/>
        </div>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth} lastUpdated={analysisCache.lastUpdated}/>
        <h2 className={'header text-center'}>{props.title}</h2>
        {track && track.length > 0 && preference.current ?
            <div className={'labml-card'}>
                <div className={'pointer-cursor'} onClick={onChartClick}>
                    <div className={'text-center mb-3'}>
                        {dots}
                    </div>
                    {chart}
                </div>
                {sparkLines}
            </div>
            :
            <LabLoader/>
        }
    </div>
}

let BasicSparkLines = forwardRef(SparkLinesCard)
let BasicBarLines = forwardRef(BarLinesCard)

export {
    BasicView,
    BasicSparkLines,
    BasicBarLines
}