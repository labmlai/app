import React from "react"

import {useLocation} from "react-router-dom"

import {SummaryCardProps, Analysis} from "../../types"
import {StdOutCard, StdOutView} from "../../../components/terminal_outputs/card"


const TITLE = 'Standard Output'
const URL = 'stdout'

function AnalysisSummary(props: SummaryCardProps) {
    return <StdOutCard title={TITLE}
                       uuid={props.uuid}
                       type={'stdout'}
                       url={URL}
                       cache={{}}
                       ref={props.refreshRef}
                       width={props.width}/>

}

function AnalysisDetails() {
    const location = useLocation()

    return <StdOutView title={TITLE}
                       cache={{}}
                       type={'stdout'}
                       location={location}
                       headerCard={{}}/>
}

let stdoutAnalysis: Analysis = {
    card: AnalysisSummary,
    view: AnalysisDetails,
    route: `${URL}`
}

export default stdoutAnalysis
