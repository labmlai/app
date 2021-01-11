import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {L1L2MeanLines} from "../../../components/charts/summary_views"
import {BasicLineView} from "../../../components/charts/detail_views"
import {RunHeaderCard} from "../run_header/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, RunStatusCache} from "../../../cache/cache"


const DETAIL_TITLE = 'Parameters - L2 Norm'
const SUMMARY_TITLE = 'Parameters'
const URL = 'parameters'


class ParameterAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'parameters', statusCache)
    }
}


class ParameterPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'parameters')
    }
}


let cache = new Cache('run', ParameterAnalysisCache, ParameterPreferenceCache)

function AnalysisSummary(props: SummaryCardProps) {
    return <L1L2MeanLines title={SUMMARY_TITLE}
                          uuid={props.uuid}
                          url={URL}
                          cache={cache}
                          ref={props.refreshRef}
                          isChartView={false}
                          width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicLineView title={DETAIL_TITLE}
                          cache={cache}
                          location={location}
                          headerCard={RunHeaderCard}/>
}

let parameterAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default parameterAnalysis
