import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue} from "../../../models/run"
import {SparkLineOptions} from "./spark_line"
import {formatFixed} from "../../../utils/value"

interface EditableSparkLineOptions extends SparkLineOptions {
}

export class EditableSparkLine {
    series: PointValue[]
    name: string
    color: string
    titleWidth: number
    chartWidth: number
    valueElem: HTMLSpanElement
    inputElem: HTMLInputElement

    constructor(opt: EditableSparkLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.color = opt.color
        this.titleWidth = Math.min(150, Math.round(opt.width * .375))
        this.chartWidth = opt.width - this.titleWidth * 2
    }

    renderValue(value?: string) {
        if (value) {
            this.valueElem.textContent = formatFixed(parseFloat(value), 6)
        } else {
            const last = this.series[this.series.length - 1]
            this.valueElem.textContent = formatFixed(last.smoothed, 6)
        }
    }

    render($: WeyaElementFunction) {
        $(`div.sparkline-list-item.list-group-item`, $ => {
            $('div.sparkline-content', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                $('span', this.name, {style: {width: `${this.titleWidth}px`, color: this.color}})
                $('span.input-container', {style: {width: `${this.titleWidth}px`}}, $ => {
                    $('span.input-content', $ => {
                        this.inputElem = $('input', '.form-range', {
                            type: "range",
                            style: {width: `${this.chartWidth}px`, color: this.color},
                        })
                    })
                })
                this.valueElem = $('span', '.value', {
                    style: {
                        width: `${this.titleWidth}px`,
                        color: this.color
                    }
                })
            })
        })

        this.inputElem.addEventListener('input', this.onSliderChange.bind(this))

        const last = this.series[this.series.length - 1]
        this.inputElem.setAttribute("max", `${last.smoothed * 10}`)
        this.inputElem.setAttribute("step", `${last.smoothed / 10}`)
        this.inputElem.setAttribute("min", `${last.smoothed / 10}`)
        this.inputElem.setAttribute("value", `${last.smoothed}`)

        this.renderValue()
    }

    onSliderChange() {
        this.renderValue(this.inputElem.value)
    }

    getInput() {
        return this.inputElem.value
    }
}
