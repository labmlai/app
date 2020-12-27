import React, {useCallback, useEffect, useRef, useState} from "react"

import mixpanel from "mixpanel-browser"

import {SeriesDataModel} from "../../models/run"
import useWindowDimensions from "../../utils/window_dimensions"
import {getChart, getSparkLines} from "./components"
import {BackButton, RefreshButton, SaveButton} from "../utils/util_buttons"
import {LabLoader} from "../utils/loader"
import {ViewCardProps} from "../../analyses/types"
import {Status} from "../../models/status"
import {getChartType} from "./utils"

function BasicView(props: ViewCardProps) {
    const params = new URLSearchParams(props.location.search)
    const UUID = params.get('uuid') as string

    const statusCache = props.cache.getStatus(UUID)
    const analysisCache = props.cache.getAnalysis(UUID)
    const preferenceCache = props.cache.getPreferences(UUID)

    const [track, setTrack] = useState(null as unknown as SeriesDataModel)
    const [status, setStatus] = useState(null as unknown as Status)
    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const [currentChart, setCurrentChart] = useState(0)
    const [isDisabled, setIsDisabled] = useState(true)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    let preference = useRef(null) as any

    useEffect(() => {
        async function load() {
            setTrack(await analysisCache.get())
            setStatus(await statusCache.get())

            if (status && !status.isRunning) {
                clearInterval(interval)
            }
        }

        mixpanel.track('Analysis View', {uuid: UUID, analysis: props.title})

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    }, [analysisCache, statusCache, UUID, status, props.title])

    useEffect(() => {
        async function load() {
            preference.current = await preferenceCache.get()

            if (preference.current) {
                setCurrentChart(preference.current.chart_type)

                let analysis_preferences = preference.current.series_preferences
                if (analysis_preferences && analysis_preferences.length > 0) {
                    setPlotIdx([...analysis_preferences])
                } else if (track) {
                    let res: number[] = []
                    for (let i = 0; i < track.series.length; i++) {
                        res.push(i)
                    }
                    setPlotIdx(res)
                }
            }
        }

        if (plotIdx === null) {
            load().then()
        }

    }, [track, preference, preferenceCache, plotIdx])

    function updatePreferences() {
        if (preference.current) {
            preference.current.series_preferences = plotIdx
            preference.current.chart_type = currentChart
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
        }
    }, [plotIdx])

    function onChartClick() {
        setIsDisabled(false)

        if (currentChart === 1) {
            setCurrentChart(0)
        } else {
            setCurrentChart(currentChart + 1)
        }
    }

    let dots: JSX.Element[] = []
    for (let i = 0; i < 2; i++) {
        if (i === currentChart) {
            dots.push(<span key={i} className={"dot color-dot"}/>)
        } else {
            dots.push(<span key={i} className={"dot"}/>)
        }
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton parent={props.title}/>
            <SaveButton onButtonClick={updatePreferences} isDisabled={isDisabled} parent={props.title}/>
            {status && status.isRunning && <RefreshButton onButtonClick={onRefresh} parent={props.title}/>}
        </div>
        <props.headerCard uuid={UUID} width={actualWidth} lastUpdated={analysisCache.lastUpdated}/>
        <h2 className={'header text-center'}>{props.title}</h2>
        {track && track.series.length > 0 && preference.current ?
            <div className={'labml-card'}>
                <div className={'pointer-cursor'} onClick={onChartClick}>
                    <div className={'text-center mb-3'}>
                        {dots}
                    </div>
                    {getChart(getChartType(currentChart), track.series, plotIdx, actualWidth, toggleChart)}
                </div>
                {getSparkLines(track.series, plotIdx, actualWidth, toggleChart)}
            </div>
            :
            <LabLoader/>
        }
    </div>
}

export {
    BasicView,
}