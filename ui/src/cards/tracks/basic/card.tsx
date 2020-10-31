import {LineChart, SparkLines} from "./components";
import React, {useCallback, useEffect, useState, forwardRef, useImperativeHandle} from "react";
import {Run, SeriesModel, Status} from "../../../models/run";
import useWindowDimensions from "../../../utils/window_dimensions";
import {defaultSeriesToPlot} from "./utils";
import RunHeaderCard from "../../run_header/card"
import CACHE from "../../../cache/cache";
import {LabLoader} from "../../../components/loader";
import {BackButton, RefreshButton} from "../../../components/util_buttons"
import {BasicProps, CardProps, ViewProps} from "../../types";
import {useHistory} from "react-router-dom";
import {useErrorHandler} from "react-error-boundary";


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
    url: string
    isChartView: boolean
}

function Card(props: BasicCardProps, ref: any) {
    const [track, setTrack] = useState(null as (SeriesModel[] | null))
    const runCache = CACHE.getRun(props.uuid)
    const history = useHistory()
    const handleError = useErrorHandler()

    async function load() {
        try {
            setTrack(await runCache[props.tracking_name](true))
        } catch (e) {
            handleError(e)
        }
    }

    useImperativeHandle(ref, () => ({
        refresh: () => {
            load().then()
        }
    }))

    useEffect(() => {
        async function load() {
            try {
                setTrack(await runCache[props.tracking_name]())
                let status = await runCache.getStatus()
                if (!status.isRunning) {
                    clearInterval(interval)
                }
            } catch (e) {
                handleError(e)
            }
        }

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    })

    let card = null
    if (props.isChartView) {
        card = getChart(track, null, props.width)
    } else {
        card = getSparkLines(track, null, props.width)
    }

    return <div className={'labml-card labml-card-action'} onClick={
        () => {
            history.push(`/${props.url}?run_uuid=${props.uuid}`, history.location.pathname);
        }
    }>
        <h3 className={'header'}>{props.name}</h3>
        {card}
    </div>
}


interface BasicViewProps extends BasicProps, ViewProps {

}

function BasicView(props: BasicViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const runCache = CACHE.getRun(runUUID)
    const [run, setRun] = useState(null as unknown as Run)
    const [status, setStatus] = useState(null as unknown as Status)
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            setTrack(await runCache[props.tracking_name]())
            let status = await runCache.getStatus()
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    })

    useEffect(() => {
        async function load() {
            setRun(await runCache.getRun())
            setStatus(await runCache.getStatus())

            if (run) {
                let preferences = run.series_preferences[props.series_preference]
                if (preferences) {
                    setPlotIdx(preferences)
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
    }, [track, run, runCache, props.series_preference])

    useEffect(() => {
        function updateRun() {
            if (run) {
                runCache.setRun(run).then()
            }
        }

        window.addEventListener('beforeunload', updateRun)

        return () => {
            updateRun()
            window.removeEventListener('beforeunload', updateRun)
        }
    }, [run, runCache])


    let toggleChart = useCallback((idx: number) => {
        if (plotIdx[idx] >= 0) {
            plotIdx[idx] = -1
        } else {
            plotIdx[idx] = Math.max(...plotIdx) + 1
        }
        setPlotIdx(new Array<number>(...plotIdx))
        run.series_preferences[props.series_preference] = plotIdx

    }, [plotIdx, run, props.series_preference])


    if (track != null && track.length > 0 && plotIdx == null) {
        setPlotIdx(defaultSeriesToPlot(track))
    }

    let chart = getChart(track, plotIdx, actualWidth, toggleChart)

    async function load() {
        setTrack(await runCache[props.tracking_name](true))
    }

    function onRefresh() {
        load().then()
    }

    return <div className={'page'} style={{width: actualWidth}}>
        <BackButton/>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth}/>
        {status && status.isRunning &&
        <RefreshButton onButtonClick={onRefresh}/>
        }
        <h2 className={'header text-center'}>{props.name}</h2>
        <div className={'labml-card'}>{chart}</div>
    </div>
}

let BasicCard = forwardRef(Card)

export {
    BasicView,
    BasicCard
}