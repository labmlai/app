import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {StdOutCard, StdOutView} from "../../../components/terminal_outputs/card"


const TITLE = 'Standard Error'
const URL = 'stderr'

function AnalysisSummary(props: SummaryCardProps) {
    return <StdOutCard title={TITLE}
                       uuid={props.uuid}
                       type={'stderr'}
                       url={URL}
                       cache={{}}
                       ref={props.refreshRef}
                       width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <StdOutView title={TITLE}
                       cache={{}}
                       type={'stderr'}
                       location={location}
                       headerCard={{}}/>
}

let stderrAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default stderrAnalysis
