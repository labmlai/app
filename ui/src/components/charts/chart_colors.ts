import d3 from "../../d3"

export const SINGLE_HUE_SCALE = [
    '#c1e7ff',
    '#abd2ec',
    '#94bed9',
    '#7faac6',
    '#6996b3',
    '#5383a1',
    '#3d708f',
    '#255e7e',
    '#004c6d',
]

interface ChartColorsOptions {
    nColors: number
}

export default class ChartColors {
    nColors: number
    linerScale: d3.ScaleLinear<number, number>
    colors: any[] = []

    constructor(opt: ChartColorsOptions) {
        this.nColors = opt.nColors
        this.linerScale = d3.scaleLinear()
            .domain(d3.ticks(0, this.nColors, SINGLE_HUE_SCALE.length))
            .range(SINGLE_HUE_SCALE)

        let nums: number[] = d3.range(0, this.nColors, 1)
        for (let n of nums) {
            this.colors.push(this.linerScale(n))
        }
    }

    getColor(i: number) {
        return this.colors[i]
    }

    getColors() {
        return this.colors
    }
}