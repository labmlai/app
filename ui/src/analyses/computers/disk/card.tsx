import React from "react"

import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../../types"
import {BasicSparkLines} from "../../../components/charts/summary_views"
import ComputerHeaderCard from "../computer_header/card"
import {BasicView} from "../../../components/charts/detail_views"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, ComputerStatusCache} from "../../../cache/cache"

const TITLE = 'Disk'
const URL = 'disk'

class DiskAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'disk', statusCache)
    }
}


class DiskPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'cpu')
    }
}


let cache = new Cache('computer', DiskAnalysisCache, DiskPreferenceCache)


function AnalysisSummary(props: SeriesCardProps) {
    return <BasicSparkLines title={TITLE}
                            url={URL}
                            cache={cache}
                            uuid={props.uuid}
                            ref={props.refreshRef}
                            isChartView={true}
                            width={props.width}/>
}

function AnalysisDetails() {
    const location = useLocation()

    return <BasicView title={TITLE}
                      cache={cache}
                      location={location}
                      headerCard={ComputerHeaderCard}/>
}


let DiskAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default DiskAnalysis
