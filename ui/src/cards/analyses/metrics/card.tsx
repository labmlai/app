import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";
import CACHE, {AnalysisCache, StatusCache} from "../../../cache/cache";

const ANALYSIS = 'Metrics'
const URL = 'metrics'

class MetricAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'metrics_track', statusCache)
    }
}

class Cache {
    private readonly analysisCaches: { [uuid: string]: AnalysisCache }

    constructor() {
        this.analysisCaches = {}
    }

    getAnalysis(uuid: string) {
        if (this.analysisCaches[uuid] == null) {
            this.analysisCaches[uuid] = new MetricAnalysisCache(uuid, CACHE.getStatus(uuid))
        }

        return this.analysisCaches[uuid]
    }
}


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS}
                      url={URL}
                      cache={new Cache()}
                      uuid={props.uuid}
                      ref={props.refreshRef}
                      isChartView={true}
                      width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS}
                      cache={new Cache()}
                      location={location}/>
}


let metricAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default metricAnalysis
