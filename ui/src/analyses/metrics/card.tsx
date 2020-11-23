import React from "react"

import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../types"
import {BasicSparkLines, BasicView} from "../../components/charts/card"
import {Cache} from "../common"
import {SeriesCache, SeriesPreferenceCache, StatusCache} from "../../cache/cache"

const TITLE = 'Metrics'
const URL = 'metrics'

class MetricAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'metrics', statusCache)
    }
}


class MetricPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'metrics')
    }
}


let cache = new Cache(MetricAnalysisCache, MetricPreferenceCache)


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicSparkLines title={TITLE}
                      url={URL}
                      cache={cache}
                      uuid={props.uuid}
                      ref={props.refreshRef}
                      isChartView={true}
                      width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView title={TITLE}
                      cache={cache}
                      location={location}/>
}


let metricAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default metricAnalysis
