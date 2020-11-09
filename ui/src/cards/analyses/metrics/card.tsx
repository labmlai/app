import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";

const ANALYSIS = 'Metrics'
const ANALYSIS_INDEX = 'metrics'
const URL = 'metrics'


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS}
                      url={URL}
                      analysisIndex={ANALYSIS_INDEX}
                      uuid={props.uuid}
                      ref={props.refreshRef}
                      isChartView={true}
                      width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS}
                      analysisIndex={ANALYSIS_INDEX}
                      location={location}/>
}


let metricAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default metricAnalysis
