import React, {useEffect, useState} from "react"
import {useHistory} from "react-router-dom";

import "./run_view.scss"
import CACHE, {Run, SeriesModel} from "../cache/cache"
import {ConfigsView} from "../components/configs";
import LineChart from "../components/chart";
import useWindowDimensions from "../utils/window_dimensions";
import {RunInfo} from "../components/run_info";
import {LabLoader} from "../components/loader"
import {Alert} from "react-bootstrap";


interface RunProps {
    location: any
}

function RunView(props: RunProps) {
    const history = useHistory();
    const [isTrackLoading, setIsTrackLoading] = useState(true)
    const [isRunLoading, setIsRunLoading] = useState(true)
    const [networkError, setNetworkError] = useState(null)

    const [run, setRun] = useState(null as unknown as Run)
    const {width: windowWidth} = useWindowDimensions()
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const params = new URLSearchParams(props.location.search)
    const runCache = CACHE.get(params.get('run_uuid') as string)
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        if (run != null && run.name.trim() !== '') {
            document.title = `LabML: ${run.name.trim()}`
        } else {
            document.title = 'LabML'
        }
    }, [run])

    useEffect(() => {
        async function loadFromServer() {
            try {
                setRun(await runCache.getRun())
                setIsRunLoading(false)
                setTrack(await runCache.getTracking())
                setIsTrackLoading(false)
            } catch (err) {
                setNetworkError(err.message)
            }
        }

        loadFromServer()
        let interval = setInterval(() => {
            loadFromServer();
        }, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [runCache]);

    let runView = null
    if(run != null) {
        runView = <div>
            <RunInfo uuid={run.uuid}
                     name={run.name} comment={run.comment}
                     start={run.start} lastUpdatedTime={run.time}
                     status={run.status}/>
            <ConfigsView configs={run.configs} width={actualWidth}/>
        </div>
    }

    let chart = null
    if (track != null && track.length > 0) {
        chart = <LineChart key={1} series={track as SeriesModel[]} width={actualWidth}/>
    }

    let style = {
        width: actualWidth
    }
    return <div>
        {(() => {
            if (networkError != null) {
                return <Alert variant={'danger'}>{networkError}</Alert>
            } else if (isRunLoading || isTrackLoading) {
                return <LabLoader isLoading={true}/>
            } else if (Object.keys(run).length === 0) {
                history.push(`/404`)
            } else {
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
        })()}
    </div>

}

export default RunView