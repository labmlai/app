import React, {useEffect, useState} from "react"

import "./run_view.scss"
import NETWORK from '../network'
import {ConfigsView} from "../components/configs";
import LineChart, {SeriesModel} from "../components/chart";
import useWindowDimensions from "../utils/window_dimensions";
import {RunInfo} from "../components/run_info";

interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const [run, setRun] = useState({
        run_uuid: '',
        name: '',
        comment: '',
        configs: [],
        start: Number.NaN,
        time: Number.NaN,
        status: {
            status: '',
            details: '',
            time: Number.NaN
        }
    })
    const {width: windowWidth} = useWindowDimensions()
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const params = new URLSearchParams(props.location.search)
    const run_uuid = params.get('run_uuid')

    const actualWidth = Math.min(800, windowWidth)
    useEffect(() => {
        if (run_uuid) {
            NETWORK.get_run(run_uuid).then((res) => {
                setRun(res.data)
            })
            NETWORK.get_tracking(run_uuid).then((res) => {
                setTrack(res.data)
            })
        }
    }, [run_uuid])

    let runView = <div id={'run'} className={'run-header'}>
        <RunInfo name={run.name} comment={run.comment}
                 start={run.start} time={run.time}
                 status={run.status} width={actualWidth}/>
        <ConfigsView configs={run.configs} width={actualWidth}/>
    </div>

    let chart = null
    if (track != null && track.length > 0) {
        chart = <LineChart key={1} series={track as SeriesModel[]} width={actualWidth}/>
    }

    let style = {
        width: actualWidth
    }
    return <div className={'run'} style={style}>
        {runView}
        {chart}
        <div className={'footer-copyright text-center'}>
            <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
            <span> | </span>
            <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
        </div>
    </div>

}

export default RunView