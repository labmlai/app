import React from "react";
import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";


const ANALYSIS = 'Time Tracking'
const analysisIndex = 'timeTracking'
const URL = 'timeTracking'

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

let timeAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default timeAnalysis
