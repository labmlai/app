import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";

const ANALYSIS = 'Metrics'
const CACHE = 'metrics'
const URL = 'metrics'


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysis={ANALYSIS}
                      url={URL}
                      cache={CACHE}
                      uuid={props.uuid}
                      ref={props.refreshRef}
                      isChartView={true}
                      width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysis={ANALYSIS}
                      series_preference={CACHE}
                      cache={CACHE}
                      location={location}/>
}


let metricAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default metricAnalysis
