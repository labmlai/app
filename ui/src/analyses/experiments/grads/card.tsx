import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {L1L2MeanLines} from "../../../components/charts/summary_views"
import {BasicLineView} from "../../../components/charts/detail_views"
import {RunHeaderCard} from "../run_header/card"
import {Cache} from "../../common"
import {SeriesCache, RunStatusCache, SeriesPreferenceCache} from "../../../cache/cache"

const DETAILS_TITLE = 'Gradients - L2 Norm'
const SUMMARY_TITLE = 'Gradients'
const URL = 'gradients'

class GradientAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'gradients', statusCache)
    }
}

class GradientPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gradients')
    }
}


let cache = new Cache('run', GradientAnalysisCache, GradientPreferenceCache)


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

    return <BasicLineView title={DETAILS_TITLE}
                          cache={cache}
                          location={location}
                          headerCard={RunHeaderCard}/>
}

let gradientAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default gradientAnalysis