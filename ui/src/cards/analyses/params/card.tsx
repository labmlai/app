import React from "react";
import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";


const ANALYSIS = 'Parameters - L2 Norm'
const CACHE = 'params'
const URL = 'params'


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

let parameterAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default parameterAnalysis
