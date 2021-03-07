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
    '#003f5c',
    '#2f4b7c',
    '#665191',
    '#a05195',
    '#d45087',
    '#f95d6a',
    '#ff7c43',
    '#ffa600'
]

interface ChartColorsOptions {
    nColors: number
    isDivergent?: boolean
}

export default class ChartColors {
    nColors: number
    isDivergent: boolean
    linerScale: d3.ScaleLinear<number, string>
    colors: string[] = []

    constructor(opt: ChartColorsOptions) {
        this.nColors = opt.nColors
        this.isDivergent = opt.isDivergent

        let colorScale = DIVERGENT_SCALE
        if (!this.isDivergent) {
            if (document.body.classList.contains('light')) {
                colorScale = [...SINGLE_HUE_SCALE].reverse()
            } else {
                colorScale = SINGLE_HUE_SCALE
            }
        }

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