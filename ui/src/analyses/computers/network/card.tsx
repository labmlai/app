import React from "react"

import {useLocation} from "react-router-dom"

import {SeriesCardProps, Analysis} from "../../types"
import {BasicSparkLines} from "../../../components/charts/summary_views"
import ComputerHeaderCard from "../computer_header/card"
import {BasicView} from "../../../components/charts/detail_views"
import {Cache} from "../../common"
import {SeriesCache, SeriesPreferenceCache, ComputerStatusCache} from "../../../cache/cache"

const TITLE = 'Network'
const URL = 'network'

class NetworkAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'network', statusCache)
    }
}


class NetworkPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'network')
    }
}


let cache = new Cache('computer', NetworkAnalysisCache, NetworkPreferenceCache)


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


let NetworkAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default NetworkAnalysis
