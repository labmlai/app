import {WeyaElementFunction} from "../../../../../lib/weya/weya"
import {PointValue, SeriesModel} from "../../../models/run"
import {ProcessModel} from "./types"
import {getExtent, getScale, getTimeScale, toDate, toPointValue} from "../../../components/charts/utils"
import d3 from "../../../d3"
import {DefaultLineGradient} from "../../../components/charts/chart_gradients"
import {formatFixed} from "../../../utils/value"
import {ROUTER} from "../../../app"
import {TimeSeriesFill, TimeSeriesPlot} from "../../../components/charts/timeseries/plot"
import {BadgeView} from "../../../components/badge";


interface ProcessSparkLineOptions {
    width: number
    name: string
    color: string
    series: PointValue[]
    stepExtent: [Date, Date]
}

class ProcessSparkLine {
    width: number
    name: string
    color: string
    series: PointValue[]
    yScale: d3.ScaleLinear<number, number>
    xScale: d3.ScaleTime<number, number>

    constructor(opt: ProcessSparkLineOptions) {
        this.width = opt.width
        this.series = opt.series
        this.name = opt.name
        this.color = opt.color

        this.yScale = getScale(getExtent([this.series], d => d.value, true), -25)
        this.xScale = getTimeScale(opt.stepExtent, this.width)
    }

    render($) {
        $(`div.sparkline-list-item.list-group-item.d-inline-block`, $ => {
            $('div.sparkline-content', {style: {width: `${this.width}px`}}, $ => {
                $('svg.sparkline', {style: {width: `${this.width}px`}, height: 36}, $ => {
                    // new DefaultLineGradient().render($)
                    $('g', {transform: `translate(${0}, 30)`}, $ => {
                        new TimeSeriesFill({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d',
                            colorIdx: 9
                        }).render($)
                        new TimeSeriesPlot({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d'
                        }).render($)
                    })
                })
                const last = this.series[this.series.length - 1]
                $('span', `${this.name}:`)
                $('span', {style: {color: this.color}}, `${formatFixed(last.smoothed, 3)}`)
            })
        })
    }

}

export interface ProcessListItemOptions {
    item: ProcessModel
    stepExtent: [Date, Date]
    width: number
    onClick: (elem: ProcessListItem) => void
}

class ProcessListItem {
    item: ProcessModel
    width: number
    elem: HTMLAnchorElement
    stepExtent: [Date, Date]
    onClick: (evt: Event) => void

    constructor(opt: ProcessListItemOptions) {
        this.item = opt.item
        this.width = opt.width
        this.stepExtent = opt.stepExtent
        this.onClick = (e: Event) => {
            e.preventDefault()
            opt.onClick(this)
        }
    }

    render($: WeyaElementFunction) {
        this.elem = $('a', '.list-item.list-group-item.list-group-item-action',
            {href: `/details/${this.item.process_id}`, on: {click: this.onClick}},
            $ => {
                $('div', $ => {
                    $('div', $ => {
                        $('span', this.item.name )
                        $('span', ` PID: ${this.item.pid}`)
                        if (this.item.dead) {
                            new BadgeView({text: 'dead'}).render($)
                        }
                    })
                    new ProcessSparkLine({
                        width: this.width / 2.2,
                        series: this.item.cpu.series,
                        stepExtent: this.stepExtent,
                        color: "#ffa600",
                        name: 'CPU'
                    }).render($)
                    new ProcessSparkLine({
                        width: this.width / 2.2,
                        series: this.item.rss.series,
                        stepExtent: this.stepExtent,
                        color: "#bc5090",
                        name: 'RSS'
                    }).render($)
                })
            })
    }
}


export interface ProcessListOptions {
    uuid: string
    items: ProcessModel[]
    width: number
}

export class ProcessList {
    uuid: string
    items: ProcessModel[]
    width: number
    stepExtent: [number, number]

    constructor(opt: ProcessListOptions) {
        this.uuid = opt.uuid
        this.items = opt.items
        this.width = opt.width

        let series: SeriesModel[] = []
        for (let item of this.items) {
            item.cpu.series = toPointValue(item.cpu)
            item.rss.series = toPointValue(item.rss)
            series.push(item.cpu)
            series.push(item.rss)
        }

        this.stepExtent = getExtent(series.map(s => s.series), d => d.step)
    }

    onclick(elem: ProcessListItem) {
        ROUTER.navigate(`session/${this.uuid}/process/${elem.item.process_id}`)
    }

    render($: WeyaElementFunction) {
        $('div', '.runs-list', $ => {
            $('div', '.list.runs-list.list-group', $ => {
                this.items.map((s, i) => {
                    new ProcessListItem({
                        item: s,
                        width: this.width,
                        stepExtent: [toDate(this.stepExtent[0]), toDate(this.stepExtent[1])],
                        onClick: this.onclick.bind(this)
                    }).render($)
                })
            })
        })
    }
}