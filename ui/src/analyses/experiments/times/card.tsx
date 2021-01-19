import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicSparkLines} from "../../../components/charts/summary_views"
import {BasicLineView} from "../../../components/charts/detail_views"
import {RunHeaderCard} from "../run_header/card"
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

function AnalysisSummary(props: SummaryCardProps) {
    return <BasicSparkLines title={TITLE}
                            uuid={props.uuid}
                            url={URL}
                            cache={cache}
                            ref={props.refreshRef}
                            width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicLineView title={TITLE}
                          cache={cache}
                          location={location}
                          headerCard={RunHeaderCard}/>
}

let timeAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default timeAnalysis
