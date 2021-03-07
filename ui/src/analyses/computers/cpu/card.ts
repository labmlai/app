import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import {Card, CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {toPointValues} from "../../../components/charts/utils"
import {Loader} from "../../../components/loader"
import cpuCache from './cache'
import {TimeSeriesChart} from '../../../components/charts/timeseries/chart'
import {Labels} from "../../../components/charts/labels"
import {ROUTER} from '../../../app'


export class CPUCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    analysisCache: SeriesCache
    lineChartContainer: WeyaElement
    elem: WeyaElement
    loader: Loader

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = cpuCache.getAnalysis(this.uuid)
        this.loader = new Loader()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'CPU')
        })

        this.elem.appendChild(this.loader.render($))
        try {
            this.series = toPointValues((await this.analysisCache.get()).summary)
        } catch (e) {
            // Let the parent view handle network failures
        }
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
        this.lineChartContainer.innerHTML = ''
        Weya(this.lineChartContainer, $ => {
            new TimeSeriesChart({
                series: this.series,
                width: this.width,
                plotIdx: [],
                yExtend: [0, 100],
                chartHeightFraction: 4
            }).render($)
        })
    }

    async refresh() {
        try {
            this.series = toPointValues((await this.analysisCache.get(true)).summary)
        } catch (e) {
            // Let the parent view handle network failures
        }

        if (this.series.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/cpu`)
    }
}
