import React from "react";
import {useLocation} from "react-router-dom";

import {SeriesCardProps} from "../../types";
import {BasicCard, BasicView} from "../basic/card";
import {Analysis} from "../basic/analysis";
import CACHE, {AnalysisCache, StatusCache} from "../../../cache/cache";


const ANALYSIS = 'Parameters - L2 Norm'
const URL = 'parameters'


class ParameterAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: StatusCache) {
        super(uuid, 'parameters_track', statusCache)
    }
}

class Cache {
    private readonly analysisCaches: { [uuid: string]: AnalysisCache }

    constructor() {
        this.analysisCaches = {}
    }

    getAnalysis(uuid: string) {
        if (this.analysisCaches[uuid] == null) {
            this.analysisCaches[uuid] = new ParameterAnalysisCache(uuid, CACHE.getStatus(uuid))
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

let parameterAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `/${URL}`
}

export default parameterAnalysis
