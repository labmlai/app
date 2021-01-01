import React from "react"

import * as d3 from "d3"


interface DensityPlotProps {
    series: number[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
}

// Function to compute density
function kernelDensityEstimator(kernel: (k: number) => number, X: number[]) {
    return function (V: number[]) {
        return X.map(function (x) : any[]{
            return [x, d3.mean(V, function (v: number) {
                return kernel(x - v)
            })]
        })
    }
}

function kernelEpanechnikov(k: number): (k: number) => number {
    return function (v: number): number {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0
    }
}

export function DensityPlot(props: DensityPlotProps) {
    // Compute kernel density estimation
    let kde = kernelDensityEstimator(kernelEpanechnikov(7), props.xScale.ticks(40))
    let density = kde(props.series)

    let densityLine = d3.line<number[]>()
        .curve(d3.curveBasis)
        .x((d) => {
            return props.xScale(d[0])
        })
        .y((d) => {
            return props.yScale(d[1])
        })

    let d: string = densityLine(density) as string

    let densityPath = <path className={'smoothed-line'} fill={'none'} stroke={props.color} d={d}/>

    return <g>
        {densityPath}
    </g>
}