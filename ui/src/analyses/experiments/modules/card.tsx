import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {L1L2MeanLines} from "../../../components/charts/summary_views"
import {BasicLineView} from "../../../components/charts/detail_views"
import {RunHeaderCard} from "../run_header/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, RunStatusCache} from "../../../cache/cache"

const DETAIL_TITLE = 'Activations - L2 Norm'
const SUMMARY_TITLE = 'Activations'
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
    return <L1L2MeanLines title={SUMMARY_TITLE}
                          uuid={props.uuid}
                          url={URL}
                          cache={cache}
                          ref={props.refreshRef}
                          width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicLineView title={DETAIL_TITLE}
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