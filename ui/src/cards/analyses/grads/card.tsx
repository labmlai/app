import React from "react";

import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicView, BasicCard} from "../basic/card";
import {Analysis} from "../basic/analysis";
import CACHE from "../../../cache/cache";
import {AnalysisCache, StatusCache} from "../../../cache/cache";

const ANALYSIS = 'Gradients - L2 Norm'
const URL = 'gradients'

class GradientAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'gradients_track', statusCache);
    }

}

class Cache {
    private readonly analysisCaches: { [uuid: string]: AnalysisCache }

    constructor() {
        this.analysisCaches = {}
    }

    getAnalysis(uuid: string) {
        if (this.analysisCaches[uuid] == null) {
            this.analysisCaches[uuid] = new GradientAnalysisCache(uuid, CACHE.getStatus(uuid))
        }

        return this.analysisCaches[uuid]
    }
}


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicCard analysisName={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      cache={new Cache()}
                      ref={props.refreshRef}
                      isChartView={false}
                      width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView analysisName={ANALYSIS}
                      cache={new Cache()}
                      location={location}/>
}

let gradientAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default gradientAnalysis