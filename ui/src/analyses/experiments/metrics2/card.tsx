import React, {useCallback, useEffect, useRef, useState} from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicSparkLines} from "../../../components/charts/summary_views"
import {RunHeaderCard} from "../run_header/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, RunStatusCache} from "../../../cache/cache"

import mixpanel from "mixpanel-browser"

import {SeriesDataModel, SeriesModel} from "../../../models/run"
import useWindowDimensions from "../../../utils/window_dimensions"
import {getSparkLines, getTimeSeriesChart} from "../../../components/charts/components"
import {BackButton, RefreshButton, SaveButton} from "../../../components/utils/util_buttons"
import {LabLoader} from "../../../components/utils/loader"
import {ViewCardProps} from "../../types"
import {Status} from "../../../models/status"
import {
    defaultSeriesToPlot,
    getChartType,
    getExtent,
    getLogScale,
    getScale,
    toPointValues
} from "../../../components/charts/utils"
import {CHART_COLORS, getColor} from "../../../components/charts/constants";
import * as d3 from "d3";
import {PointValue} from "../../../models/run"

const TITLE = 'Metrics'
const URL = 'metrics'

class MetricAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'metrics', statusCache)
    }
}


class MetricPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'metrics')
    }
}


let cache = new Cache('run', MetricAnalysisCache, MetricPreferenceCache)


function AnalysisSummary(props: SummaryCardProps) {
    return <BasicSparkLines title={TITLE}
                            url={URL}
                            cache={cache}
                            uuid={props.uuid}
                            ref={props.refreshRef}
                            isChartView={true}
                            width={props.width}/>
}

interface LinePlotProps {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    colorIdx: number
    isChartFill?: boolean
}

export function LinePlot(props: LinePlotProps) {
    let series = props.series

    let smoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.smoothed)
        })

    let d: string = smoothedLine(series) as string

    let unsmoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.value)
        })

    let smoothedPath = <path className={'smoothed-line dropshadow'} fill={'none'} stroke={props.color} d={d}/>
    let unsmoothedPath = <path className={'unsmoothed-line'} fill={'none'} stroke={props.color}
                               d={unsmoothedLine(series) as string}/>

    let dFill = ''
    if (props.isChartFill) {
        dFill = `M${props.xScale(series[0].step)},0L` +
            d.substr(1) +
            `L${props.xScale(props.series[series.length - 1].step)},0`
    }

    return <g>
        {smoothedPath}{unsmoothedPath}
    </g>
}

export function LineFill(props: LinePlotProps) {
    let series = props.series

    let smoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.smoothed)
        })

    let d: string = smoothedLine(series) as string



    let dFill = ''
    if (props.isChartFill) {
        dFill = `M${props.xScale(series[0].step)},0L` +
            d.substr(1) +
            `L${props.xScale(props.series[series.length - 1].step)},0`
    }

    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         style={{fill: `url(#gradient-${props.colorIdx}`}}
                         d={dFill}/>

    return <g>
        {pathFill}
    </g>
}


interface AxisProps {
    chartId: string
    scale: d3.ScaleLinear<number, number>
    specifier?: string
}

function BottomAxis(props: AxisProps) {
    let specifier = props.specifier !== undefined ? props.specifier : ".2s"

    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5, specifier)
    const id = `${props.chartId}_axis_bottom`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [id, axis])

    return <g id={id}/>
}

function RightAxis(props: AxisProps) {
    let specifier = props.specifier !== undefined ? props.specifier : ""

    const axis = d3.axisRight(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5, specifier)
    const id = `${props.chartId}_axis_right`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [axis, id])


    return <g id={id}/>
}

interface SeriesProps {
    series: SeriesModel[]
    plotIdx: number[]
    width: number
    onSelect?: (i: number) => void
}

interface LineChartProps extends SeriesProps {
    chartType?: 'log' | 'normal'
}

function LineChart(props: LineChartProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)

    let track = props.series

    if (track.length === 0) {
        return <div/>
    }

    let plot: SeriesModel[] = []
    let filteredPlotIdx: number[] = []
    for (let i = 0; i < props.plotIdx.length; i++) {
        if (props.plotIdx[i] >= 0) {
            filteredPlotIdx.push(i)
            plot.push(track[i])
        }
    }
    if (props.plotIdx.length > 0 && Math.max(...props.plotIdx) < 0) {
        plot = [track[0]]
        filteredPlotIdx = [0]
    }

    let plotSeries = plot.map(s => s.series)
    let yScale = getScale(getExtent(plotSeries, d => d.value, false), -chartHeight)
    const stepExtent = getExtent(track.map(s => s.series), d => d.step)
    const xScale = getScale(stepExtent, chartWidth)

    if (props.chartType && props.chartType === 'log') {
        yScale = getLogScale(getExtent(plotSeries, d => d.value, false, true), -chartHeight)
    }

    let isChartFill = true
    if (plot && plot.length > 3) {
        isChartFill = false
    }

    let lines = plot.map((s, i) => {
        return <LinePlot series={s.series} xScale={xScale} yScale={yScale}
                         color={getColor(filteredPlotIdx[i])} key={s.name} isChartFill={isChartFill}
                        colorIdx={filteredPlotIdx[i] % CHART_COLORS.length}/>
    })

    let fills = plot.map((s, i) => {
        return <LineFill series={s.series} xScale={xScale} yScale={yScale}
                         color={getColor(filteredPlotIdx[i])} key={s.name} isChartFill={isChartFill}
                        colorIdx={filteredPlotIdx[i] % CHART_COLORS.length}/>
    })

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    const gradients = CHART_COLORS.map((c, i) => {
        return <linearGradient id={`gradient-${i}`} x1={'0%'} x2={'0%'} y1={'0%'} y2={'100%'}>
            <stop offset={'0%'} stopColor={c} stopOpacity={1.0}/>
            <stop offset={'100%'} stopColor={c} stopOpacity={0.0}/>
        </linearGradient>
    })

    return <div>
        <svg id={'chart'}
             height={2 * margin + axisSize + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <defs>
                <filter id="dropshadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="0" dy="0" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA slope="0.2" type="linear"/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                {gradients}
            </defs>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                {fills} {lines}
            </g>

            <g className={'bottom-axis'}
               transform={`translate(${margin}, ${margin + chartHeight})`}>
                <BottomAxis chartId={chartId} scale={xScale}/>
            </g>
            <g className={'right-axis'}
               transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                <RightAxis chartId={chartId} scale={yScale}/>
            </g>
        </svg>
    </div>
}

let chartTypes: 'log' | 'normal'

export function getLineChart(chartType: typeof chartTypes, track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(track)
        }
        let series: SeriesModel[] = toPointValues(track)
        return <LineChart key={1} chartType={chartType} series={series} width={width} plotIdx={plotIdx}
                          onSelect={onSelect}/>
    } else {
        return <LabLoader/>
    }
}


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

    const chart = props.isTimeSeries ? getTimeSeriesChart : getLineChart

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
                    {chart(getChartType(currentChart), track.series, plotIdx, actualWidth, toggleChart)}
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

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView title={TITLE}
                      cache={cache}
                      location={location}
                      headerCard={RunHeaderCard}/>
}


let metricAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default metricAnalysis
