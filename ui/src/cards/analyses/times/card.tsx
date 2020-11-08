import React from "react";
import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";


const ANALYSIS = 'Time Tracking'
const CACHE = 'times'
const URL = 'times'

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
                      cache={CACHE}
                      location={location}/>
}

let timeAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default timeAnalysis
