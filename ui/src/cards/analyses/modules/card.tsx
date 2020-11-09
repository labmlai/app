import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";

const ANALYSIS_NAME = 'Outputs - L2 Norm'
const ANALYSIS_INDEX = 'outputs'
const URL = 'outputs'

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS_NAME}
                      uuid={props.uuid}
                      url={URL}
                      analysisIndex={ANALYSIS_INDEX}
                      ref={props.refreshRef}
                      isChartView={false}
                      width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS_NAME}
                      analysisIndex={ANALYSIS_INDEX}
                      location={location}/>
}

let moduleAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default moduleAnalysis