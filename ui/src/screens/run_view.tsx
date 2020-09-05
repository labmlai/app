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
        start: Number.NaN,
        time: Number.NaN,
        status: {
            status: '',
            details: NaN,
            time: Number.NaN
        }
    })
    const {width: windowWidth} = useWindowDimensions()
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const params = new URLSearchParams(props.location.search)
    const run_uuid = params.get('run_uuid')

    function formatTime(time: number): string {
        let date = new Date(time)
        let hours = date.getHours()
        let minutes: string | number = date.getMinutes()
        let ampm = hours >= 12 ? 'pm' : 'am'

        hours = hours % 12
        hours = hours ? hours : 12
        minutes = minutes < 10 ? '0' + minutes : minutes

        let strTime = hours + ':' + minutes + ' ' + ampm
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
    }


    function getTimeDiff(timestamp: number): string {
        let timeDiff = (Date.now() - timestamp) / (1000 * 60)

        if (timeDiff < 1) {
            return '< 1 minutes ago'
        } else if (timeDiff < 2) {
            return '< 2 minutes ago'
        } else if (timeDiff < 5) {
            return '< 5 minutes ago'
        } else if (timeDiff < 10) {
            return '< 10 minutes ago'
        }

        return formatTime(timestamp)
    }

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
            <h3 className={"d-inline"}>{run.name}</h3> <h5 className={"d-inline"}>{run.status.status}</h5>
            <h4 className={"mt-2"}>{run.comment}</h4>
            <h5 className={"mt-2"}>started {formatTime(run.start * 1000)}</h5>
            <h5>last updated {getTimeDiff(run.time * 1000)}</h5>
            <ConfigsView configs={run.configs} width={windowWidth}/>
        </div>
    }

    let chart = null
    if (track != null && track.length > 0) {
        console.log(track)
        chart = <LineChart key={1} series={track as SeriesModel[]} width={windowWidth}/>
    }

    return <div>
        {runView}
        {chart}
    </div>

}

export default RunView