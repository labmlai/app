import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicSparkTimeLines} from "../../../components/charts/summary_views"
import ComputerHeaderCard from "../computer_header/card"
import {BasicTimeSeriesView} from "../../../components/charts/detail_views"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, ComputerStatusCache} from "../../../cache/cache"

const TITLE = 'GPU'
const URL = 'gpu'

class GPUAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'gpu', statusCache)
    }
}


class GPUPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gpu')
    }
}


let cache = new Cache('computer', GPUAnalysisCache, GPUPreferenceCache)


function AnalysisSummary(props: SummaryCardProps) {
    return <BasicSparkTimeLines title={TITLE}
                                url={URL}
                                cache={cache}
                                yExtend={[0, 100]}
                                uuid={props.uuid}
                                ref={props.refreshRef}
                                chartHeightFraction={4}
                                isSetPreferences={false}
                                width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicTimeSeriesView title={TITLE}
                                cache={cache}
                                location={location}
                                yExtend={[0, 100]}
                                headerCard={ComputerHeaderCard}/>
}


let GPUAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default GPUAnalysis
