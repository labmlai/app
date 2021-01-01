import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicDensityLines, BasicBarLines} from "../../../components/charts/summary_views"
import {BasicView} from "../../../components/charts/detail_views"
import {RunHeaderCard} from "../run_header/card"
import {Cache} from "../../common"
import {SeriesCache, RunStatusCache, SeriesPreferenceCache} from "../../../cache/cache"

const TITLE = 'Gradients - L2 Norm'
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
    return <BasicDensityLines title={TITLE}
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

let gradientAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default gradientAnalysis