import React from "react"
import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../../types"
import {BasicBarLines, BasicView} from "../../../components/charts/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, RunStatusCache} from "../../../cache/cache"


const TITLE = 'Parameters - L2 Norm'
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

let parameterAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default parameterAnalysis
