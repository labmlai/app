import React from "react"

import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../../types"
import {BasicBarLines, BasicView} from "../../../components/charts/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, StatusCache} from "../../../cache/cache"

const TITLE = 'Outputs - L2 Norm'
const URL = 'outputs'


class OutputAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'outputs', statusCache)
    }
}


class OutputPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'outputs')
    }
}

let cache = new Cache(OutputAnalysisCache, OutputPreferenceCache)

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicBarLines title={TITLE}
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

let moduleAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default moduleAnalysis