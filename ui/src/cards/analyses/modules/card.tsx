import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis, Cache} from "../basic/analysis";
import {AnalysisCache, StatusCache} from "../../../cache/cache";

const ANALYSIS_NAME = 'Outputs - L2 Norm'
const URL = 'outputs'


class OutputAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'outputs_track', statusCache)
    }
}

let cache = new Cache(OutputAnalysisCache)

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS_NAME}
                      uuid={props.uuid}
                      url={URL}
                      cache={cache}
                      ref={props.refreshRef}
                      isChartView={false}
                      width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS_NAME}
                      cache={cache}
                      location={location}/>
}

let moduleAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default moduleAnalysis