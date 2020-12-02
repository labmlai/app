import React from "react"

import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../../types"
import {BasicSparkLines, BasicView} from "../../../components/charts/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, RunStatusCache} from "../../../cache/cache"

const TITLE = 'Time Tracking'
const URL = 'timeTracking'


class TimeTrackingAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'times', statusCache)
    }
}

class TimePreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'times')
    }
}

let cache = new Cache('run', TimeTrackingAnalysisCache, TimePreferenceCache)

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicSparkLines title={TITLE}
                            uuid={props.uuid}
                            url={URL}
                            cache={cache}
                            ref={props.refreshRef}
                            isChartView={false}
                            width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView title={TITLE}
                      cache={cache}
                      location={location}/>
}

let timeAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default timeAnalysis
