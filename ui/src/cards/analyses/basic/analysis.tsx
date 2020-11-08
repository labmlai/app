import React from "react"
import {useHistory} from "react-router-dom";


export interface Analysis {
    card: any
    view: any
    route: string
}


interface AnalysisProps {
    name: string
    children?: React.ReactNode
}

interface AnalysisSummaryProps extends AnalysisProps {
    uuid: string
    url: string
}

export function AnalysisSummary(props: AnalysisSummaryProps) {
    const history = useHistory()

    return <div className={'labml-card labml-card-action'} onClick={
        () => {
            history.push(`/${props.url}?run_uuid=${props.uuid}`, history.location.pathname);
        }
    }>
        <h3 className={'header'}>{props.name}</h3>
        {props.children}
    </div>
}

export function AnalysisDetails(props: AnalysisProps) {
    return <div>
        <h2 className={'header text-center'}>{props.name}</h2>
        {props.children}
    </div>
}