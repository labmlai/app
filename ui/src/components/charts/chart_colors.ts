import d3 from "../../d3"

const LIGHT_SINGLE_HUE = d3.piecewise(d3.interpolateHsl, ["#004c6d", "#c1e7ff"])
const DARK_SINGLE_HUE = d3.piecewise(d3.interpolateHsl, ["#c1e7ff", "#004c6d"])
const DIVERGENT = d3.piecewise(d3.interpolateHcl, ["#ffa600", "#bc5090", "#003f5d"])

interface ChartColorsOptions {
    nColors: number
    isDivergent?: boolean
}

export default class ChartColors {
    nColors: number
    isDivergent: boolean
    colorScale: d3.ScaleLinear<number, string>
    colors: string[] = []

    constructor(opt: ChartColorsOptions) {
        this.nColors = opt.nColors
        this.isDivergent = opt.isDivergent

        this.colorScale = DIVERGENT
        if (!this.isDivergent) {
            if (document.body.classList.contains('light')) {
                this.colorScale = LIGHT_SINGLE_HUE
            } else {
                this.colorScale = DARK_SINGLE_HUE
            }
        }

        for (let n = 0; n < this.nColors; ++n) {
            this.colors.push(this.colorScale(n / (Math.max(1, this.nColors - 1))))
        }
    }

    getColor(i: number) {
        return this.colors[i]
    }

    getColors() {
        return this.colors
    }
}