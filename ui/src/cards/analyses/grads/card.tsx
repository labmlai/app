import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicView, BasicCard} from "../basic/card";
import {Analysis} from "../basic/analysis";

const ANALYSIS = 'Gradients - L2 Norm'
const CACHE = 'grads'
const URL = 'grads'

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysis={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      cache={CACHE}
                      ref={props.refreshRef}
                      isChartView={false}
                      width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysis={ANALYSIS}
                      series_preference={CACHE}
                      cache={CACHE}
                      location={location}/>
}

let gradientAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: "/grads"
}

export default gradientAnalysis