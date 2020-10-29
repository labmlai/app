import {LineChart, SparkLines} from "./components";
import React, {useCallback, useEffect, useState} from "react";
import {Run, SeriesModel, Status} from "../../../models/run";
import useWindowDimensions from "../../../utils/window_dimensions";
import {defaultSeriesToPlot} from "./utils";
import RunHeaderCard from "../../run_header/card"
import CACHE from "../../../cache/cache";
import {LabLoader} from "../../../components/loader";
import {BackButton} from "../../../components/back_button"
import {CardProps, ViewProps, BasicProps} from "../../types";
import {useHistory} from "react-router-dom";
import {Alert} from "react-bootstrap";


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
        return <LabLoader isLoading={true}/>
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
        return <LabLoader isLoading={true}/>
    }
}


interface BasicCardProps extends BasicProps, CardProps {
    url: string
    isChartView: boolean
}

export function BasicCard(props: BasicCardProps) {
    const [track, setTrack] = useState(null as (SeriesModel[] | null))
    const runCache = CACHE.getRun(props.uuid)
    const history = useHistory();

    useEffect(() => {
        async function load() {
            try {
                setTrack(await runCache[props.tracking_name]())
                let status = await runCache.getStatus()
                if (!status.isRunning) {
                    clearInterval(interval)
                }
            } catch (e) {
                props.errorCallback(`${e}`)
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

export function BasicView(props: BasicViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string

    const runCache = CACHE.getRun(runUUID)
    const [run, setRun] = useState(null as unknown as Run)
    const [error, setError] = useState(null as (string | null))
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            setTrack(await runCache[props.tracking_name]())
        }

        load().then()
        let interval = setInterval(load, 2 * 60 * 1000)
        return () => clearInterval(interval)
    })

    useEffect(() => {
        async function load() {
            setRun(await runCache.getRun())

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
    }, [track, run])

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
    }, [run])

    let toggleChart = useCallback((idx: number) => {
        if (plotIdx[idx] >= 0) {
            plotIdx[idx] = -1
        } else {
            plotIdx[idx] = Math.max(...plotIdx) + 1
        }
        setPlotIdx(new Array<number>(...plotIdx))
        run.series_preferences[props.series_preference] = plotIdx
    }, [plotIdx])


    if (track != null && track.length > 0 && plotIdx == null) {
        setPlotIdx(defaultSeriesToPlot(track))
    }

    let chart = getChart(track, plotIdx, actualWidth, toggleChart)

    let errorCallback = useCallback((message: string) => {
        setError(message)
    }, [])

    let errorElem = null
    if (error != null) {
        errorElem = <Alert variant={'danger'}>{error}</Alert>
    }

    return <div className={'page'} style={{width: actualWidth}}>
        {errorElem}
        <BackButton/>
        <RunHeaderCard.Card uuid={runUUID} width={actualWidth} errorCallback={errorCallback}/>
        <h2 className={'header text-center'}>{props.name}</h2>
        <div className={'labml-card'}>{chart}</div>
    </div>
}

