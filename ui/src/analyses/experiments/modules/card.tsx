import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicBarLines} from "../../../components/charts/summary_views"
import {BasicView} from "../../../components/charts/detail_views"
import RunHeaderCard from "../run_header/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, RunStatusCache} from "../../../cache/cache"

const TITLE = 'Activations - L2 Norm'
const URL = 'outputs'


class OutputAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'outputs', statusCache)
    }
}


class OutputPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'outputs')
    }
}

let cache = new Cache('run', OutputAnalysisCache, OutputPreferenceCache)

function AnalysisSummary(props: SummaryCardProps) {
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
                      location={location}
                      headerCard={RunHeaderCard}/>
}

let moduleAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default moduleAnalysis