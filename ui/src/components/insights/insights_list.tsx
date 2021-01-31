import React from "react"

import {InsightModel} from "../../models/run"
import {faLightbulb} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import "./insights_list.scss"


function Insight(props: InsightModel) {
    let className = 'insight-container'

    if (props.type === 'danger') {
        className += ' danger'
    } else if (props.type === 'warning') {
        className += ' warning'
    } else {
        className += ' success'
    }

    return <div className={className}>
        <span className='icon'><FontAwesomeIcon icon={faLightbulb}/></span>
        <span className={'info'}>{props.message}</span>
    </div>
}

interface InsightsListProps {
    insightList: InsightModel[]
}

function InsightsList(props: InsightsListProps) {
    return <div>
        {props.insightList && props.insightList.map((insight, idx) => (
            <Insight key={idx}
                     message={insight.message}
                     type={insight.type}
                     time={insight.time}/>
        ))}
    </div>
}

export default InsightsList
