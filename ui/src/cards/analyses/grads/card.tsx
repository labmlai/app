import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicView, BasicCard} from "../basic/card";
import {Analysis} from "../basic/analysis";

const ANALYSIS = 'Gradients - L2 Norm'
const analysisIndex = 'gradients'
const URL = 'gradients'

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      analysisIndex={analysisIndex}
                      ref={props.refreshRef}
                      isChartView={false}
                      width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS}
                      analysisIndex={analysisIndex}
                      location={location}/>
}

let gradientAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: "/grads"
}

export default gradientAnalysis