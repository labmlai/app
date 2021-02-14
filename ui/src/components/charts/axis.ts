import d3 from "../../d3"

interface AxisOptions {
    chartId: string
    scale: d3.ScaleLinear<number, number>
    specifier?: string
    numTicks?: number
}

export class RightAxis {
    chartId: string
    scale: d3.ScaleLinear<number, number>
    specifier?: string
    numTicks?: number

    constructor(opt: AxisOptions) {
        this.chartId = opt.chartId
        this.scale = opt.scale
        this.specifier = opt.specifier !== undefined ? opt.specifier : ""
        this.numTicks = opt.numTicks !== undefined ? opt.numTicks : 5
    }
}