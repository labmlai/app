import {LineChart} from "./components";
import React, {useCallback, useState} from "react";
import {SeriesModel} from "../../../models/run";
import useWindowDimensions from "../../../utils/window_dimensions";
import {defaultSeriesToPlot} from "./utils";
import {LabLoader} from "../../../components/loader";


export function getChart(track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
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


interface TrackViewProps {
    track: SeriesModel[] | null
}

export function BasicView(props: TrackViewProps) {
    const [plotIdx, setPlotIdx] = useState(null as unknown as number[])
    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    let toggleChart = useCallback((idx: number) => {
        if (plotIdx[idx] >= 0) {
            plotIdx[idx] = -1
        } else {
            plotIdx[idx] = Math.max(...plotIdx) + 1
        }
        setPlotIdx(new Array<number>(...plotIdx))
    }, [plotIdx])


    if (props.track != null && props.track.length > 0 && plotIdx == null) {
        setPlotIdx(defaultSeriesToPlot(props.track))
    }

    let chart = getChart(props.track, plotIdx, actualWidth, toggleChart)


    return <div className={'page'} style={{width: actualWidth}}>
        <div className={'labml-card'}>{chart}</div>
    </div>
}

