import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {BasicSparkTimeLines} from "../../../components/charts/summary_views"
import {BasicTimeSeriesView} from "../../../components/charts/detail_views"
import ComputerHeaderCard from "../computer_header/card"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, ComputerStatusCache} from "../../../cache/cache"

const TITLE = 'CPU'
const URL = 'cpu'

class CPUAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'cpu', statusCache)
    }
}


class CPUPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'cpu')
    }
}


let cache = new Cache('computer', CPUAnalysisCache, CPUPreferenceCache)


function AnalysisSummary(props: SummaryCardProps) {
    return <BasicSparkTimeLines title={TITLE}
                                yExtend={[0, 100]}
                                url={URL}
                                cache={cache}
                                uuid={props.uuid}
                                ref={props.refreshRef}
                                isChartView={true}
                                chartHeightFraction={2}
                                width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicTimeSeriesView title={TITLE}
                                cache={cache}
                                yExtend={[0, 100]}
                                location={location}
                                headerCard={ComputerHeaderCard}/>
}


let CpuAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default CpuAnalysis
