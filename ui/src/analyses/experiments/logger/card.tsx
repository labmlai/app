import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {StdOutCard, StdOutView} from "../../../components/terminal_outputs/card"


const TITLE = 'Logger'
const URL = 'logger'

function AnalysisSummary(props: SummaryCardProps) {
    return <StdOutCard title={TITLE}
                       uuid={props.uuid}
                       type={'logger'}
                       url={URL}
                       cache={{}}
                       ref={props.refreshRef}
                       width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <StdOutView title={TITLE}
                       cache={{}}
                       type={'logger'}
                       location={location}
                       headerCard={{}}/>
}

let loggerAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default loggerAnalysis
