import React from "react"

import {CHART_COLORS} from "./constants"


function Gradients() {
    const gradients = CHART_COLORS.map((c, i) => {
        return <linearGradient id={`gradient-${i}`} x1={'0%'} x2={'0%'} y1={'0%'} y2={'100%'}>
            <stop offset={'0%'} stopColor={c} stopOpacity={1.0}/>
            <stop offset={'100%'} stopColor={c} stopOpacity={0.0}/>
        </linearGradient>
    })

    return <defs>
        <filter id="dropshadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="0" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA slope="0.2" type="linear"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        {gradients}
    </defs>
}


export default Gradients