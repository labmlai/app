import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react"

import {useHistory} from "react-router-dom"

import {getLineChart} from "./lines/chart"
import {getSparkLines} from "./sparklines/chart"
import {getSimpleLineChart} from "./simplelines/chart"
import {getTimeSeriesChart} from "./timeseries/chart"
import InsightsList from "../insights/insights_list"
import {BarLines} from "./barlines/chart"
import {SeriesDataModel, SeriesModel, InsightModel} from "../../models/run"
import {LabLoader} from "../utils/loader"
import {BasicProps, CardProps} from "../../analyses/types"
import {getChartType, toPointValues} from "./utils"


import "./style.scss"


interface BasicCardProps extends BasicProps, CardProps {
    isChartView: boolean
    url: string
}

function SparkLinesCard(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as unknown as SeriesModel[])
    const [insights, setInsights] = useState(null as unknown as InsightModel[])

    const history = useHistory()

    const analysisCache = props.cache.getAnalysis(props.uuid)
    const preferenceCache = props.cache.getPreferences(props.uuid)

    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const [currentChart, setCurrentChart] = useState(0)

    let preference = useRef(null) as any

    useEffect(() => {
        async function load() {
            preference.current = await preferenceCache.get()

            if (preference.current) {
                setCurrentChart(preference.current.chart_type)

                let analysis_preferences = preference.current.series_preferences
                if (analysis_preferences && analysis_preferences.length > 0) {
                    setPlotIdx([...analysis_preferences])
                }
            }
        }

        load().then()
    }, [preference, preferenceCache])


    async function onRefresh() {
        let res: SeriesDataModel = await analysisCache.get(true)
        if (res) {
            setTrack(toPointValues(res.series))
            setInsights(res.insights)
        }
    }

    async function onLoad() {
        let res: SeriesDataModel = await analysisCache.get()
        if (res) {
            setTrack(toPointValues(res.series))
            setInsights(res.insights)
        }
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
                    history.push(`/${props.url}?uuid=${props.uuid}`, history.location.pathname);
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                {props.isChartView && getLineChart(getChartType(currentChart), track, plotIdx, props.width)}
                {getSparkLines(track, plotIdx, props.width)}
                <InsightsList insightList={insights}/>
            </div>
            : <div/>
    }
    </div>
}

function BarLinesCard(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as (SeriesDataModel | null))
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
        : track && track.series.length > 0 ?
            <div className={'labml-card labml-card-action'} onClick={
                () => {
                    history.push(`/${props.url}?uuid=${props.uuid}`, history.location.pathname);
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                <BarLines width={props.width} series={track.series}/>
            </div>
            : <div/>
    }
    </div>
}

function L1L2MeanLinesCard(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as (SeriesDataModel | null))
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
        : track && track.summary.length > 0 ?
            <div className={'labml-card labml-card-action'} onClick={
                () => {
                    history.push(`/${props.url}?uuid=${props.uuid}`, history.location.pathname);
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                {getSimpleLineChart(track.summary, props.width)}
            </div>
            : <div/>
    }
    </div>
}

interface SparkTimeLinesCardProps extends BasicCardProps {
    yExtend?: [number, number] | null
    forceYStart?: number | null
    chartHeightFraction?: number
}

function SparkTimeLinesCard(props: SparkTimeLinesCardProps, ref: any) {
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const history = useHistory()

    const analysisCache = props.cache.getAnalysis(props.uuid)
    const preferenceCache = props.cache.getPreferences(props.uuid)

    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])

    let preference = useRef(null) as any

    useEffect(() => {
        async function load() {
            preference.current = await preferenceCache.get()

            if (preference.current) {
                let analysis_preferences = preference.current.series_preferences
                if (analysis_preferences && analysis_preferences.length > 0) {
                    setPlotIdx([...analysis_preferences])
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
    }, [preference, preferenceCache, track])

    async function onRefresh() {
        let res: SeriesDataModel = await analysisCache.get(true)
        if (res) {
            setTrack(toPointValues(res.summary))
        }
    }

    async function onLoad() {
        let res: SeriesDataModel = await analysisCache.get()
        if (res) {
            setTrack(toPointValues(res.summary))
        }
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
                    history.push(`/${props.url}?uuid=${props.uuid}`, history.location.pathname);
                }
            }>
                <h3 className={'header'}>{props.title}</h3>
                {props.isChartView && getTimeSeriesChart(getChartType(0), track, plotIdx, props.width, () => {
                }, props.yExtend, props.chartHeightFraction, props.forceYStart)}
            </div>
            : <div/>
    }
    </div>
}


let BasicSparkLines = forwardRef(SparkLinesCard)
let BasicSparkTimeLines = forwardRef(SparkTimeLinesCard)
let BasicBarLines = forwardRef(BarLinesCard)
let L1L2MeanLines = forwardRef(L1L2MeanLinesCard)

export {
    BasicSparkLines,
    BasicBarLines,
    L1L2MeanLines,
    BasicSparkTimeLines
}