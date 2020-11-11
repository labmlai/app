import React from "react";
import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis, Cache} from "../basic/analysis";
import {AnalysisCache, AnalysisPreferenceCache, StatusCache} from "../../../cache/cache";

const ANALYSIS = 'Time Tracking'
const URL = 'timeTracking'


class TimeTrackingAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'times', statusCache)
    }
}

class TimePreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'times');
    }
}

let cache = new Cache(TimeTrackingAnalysisCache, TimePreferenceCache)

function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      cache={cache}
                      ref={props.refreshRef}
                      isChartView={false}
                      width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS}
                      cache={cache}
                      location={location}/>
}

let timeAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default timeAnalysis
