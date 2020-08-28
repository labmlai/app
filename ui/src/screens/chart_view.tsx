import React, {useEffect, useState} from "react"

import NETWORK from '../network'
import LineChart, {SeriesModel} from "../components/chart";

interface ChartProps {
    location: any
}

function ChartView(props: ChartProps) {
    const [track, setTrack] = useState(null as unknown as SeriesModel[])

    const params = new URLSearchParams(props.location.search)
    const run_uuid = params.get('run_uuid')

    useEffect(() => {
        if (run_uuid) {
            NETWORK.get_tracking(run_uuid).then((res) => {
                setTrack(res.data)
            })
        }
    }, [run_uuid])

    let chart = null
    if (track != null) {
        chart = <LineChart key={1} series={track as SeriesModel[]}/>
    }

    return <div>
        {chart}
    </div>

}

export default ChartView