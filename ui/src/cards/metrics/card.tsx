import {LineChart} from "./components";
import React, {useCallback, useEffect, useState} from "react";
import {SeriesModel} from "../../models/run";
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom";
import useWindowDimensions from "../../utils/window_dimensions";
import {CardProps, ViewProps} from "../types";
import {defaultSeriesToPlot} from "./utils";
import {LabLoader} from "../../components/loader";

function getChart(track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
    if (track != null) {
        if (track.length == 0) {
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

function Card(props: CardProps) {
    const [track, setTrack] = useState(null as (SeriesModel[] | null))
    const runCache = CACHE.get(props.uuid)
    const history = useHistory();

    useEffect(() => {
        async function load() {
            setTrack(await runCache.getTracking())
        }

        load().then()
            .catch((e) => {
                props.errorCallback(`${e}`)
            })
    })

    let chart = getChart(track, null, props.width)

    return <div className={'labml-card labml-card-action'} onClick={
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
            setTrack(await runCache.getTracking())
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


    if (track != null && track.length > 0 && plotIdx == null) {
        setPlotIdx(defaultSeriesToPlot(track))
    }

    let chart = getChart(track, plotIdx, actualWidth, toggleChart)


    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'labml-card'}>{chart}</div>
    </div>
}

export default {
    Card,
    View
}