import {WeyaElementFunction} from "../../../../../lib/weya/weya"
import {SeriesModel} from "../../../models/run"
import {LineFill, LinePlot} from "../../../components/charts/lines/plot"
import {getExtent, getScale, toPointValues} from "../../../components/charts/utils"
import d3 from "../../../d3"
import {DefaultLineGradient} from "../../../components/charts/chart_gradients"
import {formatFixed} from "../../../utils/value"

export interface ProcessListItemOptions {
    item: SeriesModel
    stepExtent: [number, number]
    width: number
    onClick?: () => void
}

class ProcessListItem {
    item: SeriesModel
    width: number
    elem: HTMLAnchorElement
    onClick: (evt: Event) => void
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>

    constructor(opt: ProcessListItemOptions) {
        this.item = opt.item
        this.width = opt.width
        this.onClick = (e: Event) => {
            e.preventDefault()
            opt.onClick()
        }

        this.yScale = getScale(getExtent([this.item.series], d => d.value, true), -25)
        this.xScale = getScale(opt.stepExtent, this.width)
    }

    render($: WeyaElementFunction) {
        this.elem = $('a', '.list-item.list-group-item.list-group-item-action', $ => {
            $('div', $ => {
                $('p', this.item.name)
                $(`div.sparkline-list-item.list-group-item`, $ => {
                    $('div.sparkline-content', {style: {width: `${this.width}px`}}, $ => {
                        $('svg.sparkline', {style: {width: `${this.width / 3}px`}, height: 36}, $ => {
                            new DefaultLineGradient().render($)
                            $('g', {transform: `translate(${0}, 30)`}, $ => {
                                new LineFill({
                                    series: this.item.series,
                                    xScale: this.xScale,
                                    yScale: this.yScale,
                                    color: '#7f8c8d',
                                    colorIdx: 9
                                }).render($)
                                new LinePlot({
                                    series: this.item.series,
                                    xScale: this.xScale,
                                    yScale: this.yScale,
                                    color: '#7f8c8d'
                                }).render($)
                            })
                        })
                        const last = this.item.series[this.item.series.length - 1]
                        $('span',  formatFixed(last.smoothed, 3))
                    })
                })
            })
        })
    }
}


export interface ProcessListOptions {
    items: SeriesModel[]
    width: number
}


export class ProcessList {
    items: SeriesModel[]
    width: number
    stepExtent: [number, number]

    constructor(opt: ProcessListOptions) {
        this.items = toPointValues(opt.items)
        this.width = opt.width

        this.stepExtent = getExtent(this.items.map(s => s.series), d => d.step)
    }

    render($: WeyaElementFunction) {
        $('div', '.runs-list', $ => {
            $('div', '.list.runs-list.list-group', $ => {
                this.items.map((s, i) => {
                    new ProcessListItem({item: s, width: this.width, stepExtent: this.stepExtent}).render($)
                })
            })
        })
    }
}