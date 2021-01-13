import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicSparkTimeLines} from "../../../components/charts/summary_views"
import ComputerHeaderCard from "../computer_header/card"
import {BasicTimeSeriesView} from "../../../components/charts/detail_views"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, ComputerStatusCache} from "../../../cache/cache"

const TITLE = 'Memory'
const URL = 'memory'

class MemoryAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'memory', statusCache)
    }
}


class MemoryPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'memory')
    }
}


let cache = new Cache('computer', MemoryAnalysisCache, MemoryPreferenceCache)


function AnalysisSummary(props: SummaryCardProps) {
    return <BasicSparkTimeLines title={TITLE}
                                url={URL}
                                cache={cache}
                                uuid={props.uuid}
                                ref={props.refreshRef}
                                isChartView={true}
                                chartHeightFraction={2}
                                 forceYStart={0}
                                width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicTimeSeriesView title={TITLE}
                                cache={cache}
                                location={location}
                                 forceYStart={0}
                                headerCard={ComputerHeaderCard}/>
}


let MemoryAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default MemoryAnalysis
