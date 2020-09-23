import {LineChart} from "./components";
import React, {useEffect, useState} from "react";
import {SeriesModel} from "../../models/run";
import CACHE from "../../cache/cache"
import {useHistory} from "react-router-dom";
import useWindowDimensions from "../../utils/window_dimensions";
import {CardProps, ViewProps} from "../types";

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
        chart = <LineChart key={1} series={track as SeriesModel[]} width={props.width}/>
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

    let chart = null
    if (track != null && track.length > 0) {
        chart = <LineChart key={1} series={track as SeriesModel[]} width={actualWidth}/>
    }

    return <div className={'page'}  style={{width: actualWidth}}>{chart}</div>
}

export default {
    Card,
    View
}