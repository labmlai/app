import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react"

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"

import {LineChart, SparkLines} from "./components"
import {SeriesModel} from "../../models/run"
import useWindowDimensions from "../../utils/window_dimensions"
import {defaultSeriesToPlot} from "./utils"
import RunHeaderCard from "../../analyses/run_header/card"
import CACHE from "../../cache/cache"
import {LabLoader} from "../loader"
import {BackButton, RefreshButton} from "../util_buttons"
import {BasicProps, CardProps, ViewProps} from "../../analyses/types"


function getChart(track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        let series = track as SeriesModel[]
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(series)
        }
        return <LineChart key={1} series={series} width={width} plotIdx={plotIdx} onSelect={onSelect}/>
    } else {
        return <LabLoader/>
    }
}


function getSparkLines(track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        let series = track as SeriesModel[]
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(series)
        }
        return <SparkLines series={series} width={width} plotIdx={plotIdx} onSelect={onSelect}/>
    } else {
        return <LabLoader/>
    }
}


interface BasicCardProps extends BasicProps, CardProps {
    isChartView: boolean
    url: string
}

function Card(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as (SeriesModel[] | null))
    const analysisCache = props.cache.getAnalysis(props.uuid)
    const history = useHistory()

    async function load() {
        setTrack(await analysisCache.get(true))
    }

    useImperativeHandle(ref, () => ({
        refresh: () => {
            load().then()
        },
        lastUpdated: analysisCache.lastUpdated
    }))

    let card = null
    if (props.isChartView) {
        card = getChart(track, null, props.width)
    } else {
        card = getSparkLines(track, null, props.width)
    }

    return <div>{track && track.length > 0 ?
        <div className={'labml-card labml-card-action'} onClick={
            () => {
                history.push(`/${props.url}?run_uuid=${props.uuid}`, history.location.pathname);
            }
        }>
            <h3 className={'header'}>{props.title}</h3>
            {card}
        </div>
        :
        <LabLoader/>
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

    useEffect(() => {
        function updatePreference() {
            if (preference.current) {
                preferenceCache.setPreference(preference.current).then()
            }
        }

        window.addEventListener('beforeunload', updatePreference)

        return () => {
            updatePreference()
            window.removeEventListener('beforeunload', updatePreference)
        }
    }, [preference, preferenceCache])

    async function load() {
        setTrack(await analysisCache.get(true))
    }

    function onRefresh() {
        load().then()
    }


    let toggleChart = useCallback((idx: number) => {
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


    if (track != null && track.length > 0 && plotIdx == null) {
        setPlotIdx(defaultSeriesToPlot(track))
    }

    let chart = getChart(track, plotIdx, actualWidth, toggleChart)

    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'flex-container'}>
            <BackButton/>
            <RefreshButton onButtonClick={onRefresh} runUUID={runUUID}/>
        </div>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth} lastUpdated={analysisCache.lastUpdated}/>
        <h2 className={'header text-center'}>{props.title}</h2>
        <div className={'labml-card'}>{chart}</div>
    </div>
}

let BasicCard = forwardRef(Card)

export {
    BasicView,
    BasicCard
}