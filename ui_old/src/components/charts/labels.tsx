import React from "react"

import {getColor} from "./constants"

interface LabelsProps {
    labels: string[]
    colorBias?: number
}

export default function Labels(props: LabelsProps) {
    return <div className={'text-center labels text-secondary'}>
        {props.labels.map((label, i) => {
            const colorBias = props.colorBias ? props.colorBias : 0
            return <span key={i}>
                <div className='box' style={{backgroundColor: getColor(i + colorBias)}}></div>
                {label}
            </span>
        })}
    </div>
}
