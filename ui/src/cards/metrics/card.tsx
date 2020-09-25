import {LineChart} from "./components";
import React, {useCallback, useEffect, useState} from "react";
import {SeriesModel} from "../../models/run";
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom";
import useWindowDimensions from "../../utils/window_dimensions";
import {CardProps, ViewProps} from "../types";
import {defaultSeriesToPlot} from "./utils";

function Card(props: CardProps) {
    const [track, setTrack] = useState(null as unknown as SeriesModel[])
    const runCache = CACHE.get(props.uuid)
    const history = useHistory();

    useEffect(() => {
        async function load() {
            try {
                setTrack(await runCache.getTracking())
            } catch (e) {
            }
        }

        load().then()
    })

    let chart = null
    if (track != null && track.length > 0) {
        let series = track as SeriesModel[]
        let plotIdx = defaultSeriesToPlot(series)
        chart = <LineChart key={1} series={series} width={props.width} plotIdx={plotIdx}/>
    }

    return <div onClick={
        () => {
            history.push(`/metrics?run_uuid=${props.uuid}`);
        }
    }>{chart}</div>
}

function View(props: ViewProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('run_uuid') as string
    const runCache = CACHE.get(runUUID)
    const [track, setTrack] = useState(null as unknown as SeriesModel[])
    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        async function load() {
            try {
                setTrack(await runCache.getTracking())
            } catch (e) {
            }
        }

        load().then()
    })

    let toggleChart = useCallback((idx: number) => {
        if (plotIdx[idx] >= 0) {
            plotIdx[idx] = -1
        } else {
            plotIdx[idx] = Math.max(...plotIdx) + 1
        }
        setPlotIdx(new Array<number>(...plotIdx))
    }, [plotIdx])


    let chart = null
    if (track != null && track.length > 0) {
        let series = track as SeriesModel[]
        if (plotIdx == null) {
            setPlotIdx(defaultSeriesToPlot(series))
        }

        chart = <LineChart key={1} series={series} width={actualWidth} plotIdx={plotIdx} onSelect={toggleChart}/>
    }

    return <div className={'page'} style={{width: actualWidth}}>{chart}</div>
}

export default {
    Card,
    View
}