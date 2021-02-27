import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {toPointValues} from "../../../components/charts/utils"
import {Loader} from "../../../components/loader"
import gpuCache from './cache';
import {TimeSeriesChart} from "../../../components/charts/timeseries/chart"
import {Labels} from "../../../components/charts/labels"


export class GPUCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    analysisCache: SeriesCache
    lineChartContainer: WeyaElement
    elem: WeyaElement
    loader: Loader
    plotIdx: number[] = []

    constructor(opt: CardOptions) {
        super({...opt, path: 'gpu'})

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = gpuCache.getAnalysis(this.uuid)
        this.loader = new Loader()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'GPU')
        })

        this.elem.appendChild(this.loader.render($))
        this.series = toPointValues((await this.analysisCache.get()).summary)
        this.loader.remove()

        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
            new Labels({labels: Array.from(this.series, x => x['name'])}).render($)
        })

        if (this.series.length > 0) {
            this.renderLineChart()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderLineChart() {
        let res: number[] = []
        for (let i = 0; i < this.series.length; i++) {
            res.push(i)
        }
        this.plotIdx = res

        this.lineChartContainer.innerHTML = ''
        Weya(this.lineChartContainer, $ => {
            new TimeSeriesChart({
                series: this.series,
                width: this.width,
                plotIdx: this.plotIdx,
                yExtend: [0, 100],
                chartHeightFraction: 4
            }).render($)
        })
    }

    async refresh() {
        this.series = toPointValues((await this.analysisCache.get(true)).summary)

        if (this.series.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
        }
    }
}
