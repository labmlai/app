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
    inputRangeElem: HTMLInputElement
    inputValueElem: HTMLInputElement

    constructor(opt: EditableSparkLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.color = opt.color
        this.titleWidth = Math.min(150, Math.round(opt.width * .375))
        this.chartWidth = opt.width - this.titleWidth * 2
    }

    renderValue(value?: string) {
        if (value) {
            this.inputValueElem.value = formatFixed(parseFloat(value), 6)
        } else {
            const last = this.series[this.series.length - 1]
            this.inputValueElem.value = formatFixed(last.smoothed, 6)
        }
    }

    render($: WeyaElementFunction) {
        $(`div.sparkline-list-item.list-group-item`, $ => {
            $('div.sparkline-content', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                $('span.input-container', {style: {width: `${this.titleWidth}px`}}, $ => {
                    $('span.input-content.float-left', {style: {width: `${this.titleWidth / 1.5}px`}}, $ => {
                        this.inputValueElem = $('input', {style: {height: '36px'}})
                    })
                })
                this.inputRangeElem = $('input', '.form-range', {
                    type: "range",
                    style: {width: `${this.chartWidth}px`},
                })
            })
        })

        this.inputRangeElem.addEventListener('input', this.onSliderChange.bind(this))
        this.inputValueElem.addEventListener('input', this.onInputChange.bind(this))

        const last = this.series[this.series.length - 1]
        this.updateSliderConfig(last.smoothed)

        this.renderValue()
    }

    updateSliderConfig(value: number) {
        this.inputRangeElem.setAttribute("max", `${value * 10}`)
        this.inputRangeElem.setAttribute("step", `${value / 10}`)
        this.inputRangeElem.setAttribute("min", `${value / 10}`)
        this.inputRangeElem.setAttribute("value", `${value}`)
    }

    onSliderChange() {
        this.renderValue(this.inputRangeElem.value)
    }

    onInputChange() {
        let number = Number(this.inputValueElem.value)
        if (number) {
            this.inputRangeElem.setAttribute("value", `${number}`)
            this.updateSliderConfig(number)
        }
    }

    getInput() {
        return this.inputRangeElem.value
    }
}
