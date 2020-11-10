import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis, Cache} from "../basic/analysis";
import {AnalysisCache, StatusCache} from "../../../cache/cache";

const ANALYSIS = 'Metrics'
const URL = 'metrics'

class MetricAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'metrics_track', statusCache)
    }
}

let cache = new Cache(MetricAnalysisCache)


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS}
                      url={URL}
                      cache={cache}
                      uuid={props.uuid}
                      ref={props.refreshRef}
                      isChartView={true}
                      width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS}
                      cache={cache}
                      location={location}/>
}


let metricAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default metricAnalysis
