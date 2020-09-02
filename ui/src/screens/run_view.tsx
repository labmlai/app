import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import {ConfigsView} from "../components/configs";
import LineChart, {SeriesModel} from "../components/chart";
import useWindowDimensions from "../utils/window_dimensions";

interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const [run, setRun] = useState({
        run_uuid: '',
        name: '',
        comment: '',
        configs: [],
    })
    const { width: windowWidth } = useWindowDimensions()
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const params = new URLSearchParams(props.location.search)
    const run_uuid = params.get('run_uuid')

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

    let runView = null
    if (run.configs.length !== 0) {
        let style = {
            width: `${windowWidth}px`
        }
        runView = <div id={'run'} className={'run'}>
            <h3>{run.name}</h3>
            <h4>{run.comment}</h4>
            <ConfigsView configs={run.configs} width={windowWidth}/>
        </div>
    }

    let chart = null
    if (track != null) {
        chart = <LineChart key={1} series={track as SeriesModel[]}/>
    }

    return <div>
        {runView}
        {chart}
    </div>

}

export default RunView