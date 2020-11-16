import React from "react"

import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../types"
import {BasicSparkLines, BasicView} from "../../components/basic/card"
import {Cache} from "../common"
import {SeriesCache, SeriesPreferenceCache, StatusCache} from "../../cache/cache"

const TITLE = 'Time Tracking'
const URL = 'timeTracking'


class TimeTrackingAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'times', statusCache)
    }
}

class TimePreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'times')
    }
}

let cache = new Cache(TimeTrackingAnalysisCache, TimePreferenceCache)

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
