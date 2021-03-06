import d3 from "../../d3"

const SINGLE_HUE_SCALE = [
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

const DIVERGENT_SCALE = [
    '#00876c',
    '#57a18b',
    '#8cbcac',
    '#bed6ce',
    '#f1f1f1',
    '#f1c6c6',
    '#ec9c9d',
    '#e27076',
    '#d43d51',
]

interface ChartColorsOptions {
    nColors: number
    isDivergent?: boolean
}

export default class ChartColors {
    nColors: number
    isDivergent: boolean
    linerScale: d3.ScaleLinear<number, number>
    colors: any[] = []

    constructor(opt: ChartColorsOptions) {
        this.nColors = opt.nColors
        this.isDivergent = opt.isDivergent

        let colorScale = this.isDivergent ? DIVERGENT_SCALE : SINGLE_HUE_SCALE

        this.linerScale = d3.scaleLinear()
            .domain(d3.ticks(0, this.nColors, colorScale.length))
            .range(colorScale)

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