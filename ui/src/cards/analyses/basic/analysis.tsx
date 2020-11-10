import React from "react"
import CACHE, {AnalysisCache} from "../../../cache/cache";


export interface Analysis {
    card: any
    view: any
    route: string
}


export class Cache {
    private readonly analysisCaches: { [uuid: string]: AnalysisCache }
    private readonly Analysis: any

    constructor(analysis: any) {
        this.analysisCaches = {}
        this.Analysis = analysis
    }

    getAnalysis(uuid: string) {
        if (this.analysisCaches[uuid] == null) {
            this.analysisCaches[uuid] = new this.Analysis(uuid, CACHE.getStatus(uuid))
        }

        return this.analysisCaches[uuid]
    }
}
