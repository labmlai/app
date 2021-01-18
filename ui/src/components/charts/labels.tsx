import React from "react"

import {getColor} from "./constants"

interface LabelsProps {
    labels: string[]
}

export default function Labels(props: LabelsProps) {
    return <div className={'text-center labels text-secondary'}>
        {props.labels.map((label, i) => {
            return <span>
                <div className='box' style={{backgroundColor: getColor(i)}}></div>
                {label}
            </span>
        })}
    </div>
}
