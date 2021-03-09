import {SeriesModel} from "../../../models/run"
import {AnalysisDataCache} from "../../../cache/cache"
import {Weya, WeyaElement, WeyaElementFunction} from "../../../../../lib/weya/weya"
import {Loader} from "../../../components/loader"
import {Card, CardOptions} from "../../types"
import gpuCache from "./cache"
import {getSeriesData} from "./utils"
import {Labels} from "../../../components/charts/labels"
import {TimeSeriesChart} from "../../../components/charts/timeseries/chart"
import {ROUTER} from "../../../app"

export class GPUTempCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    analysisCache: AnalysisDataCache
    lineChartContainer: WeyaElement
    elem: WeyaElement
    loader: Loader
    plotIdx: number[] = []

    constructor(opt: CardOptions) {
        super(opt)

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
            $('h3.header', 'GPU - Temperature')
        })

        this.elem.appendChild(this.loader.render($))
        try {
            this.series = getSeriesData((await this.analysisCache.get()).series, 'temperature')
        } catch (e) {
            // Let the parent view handle network failures
        }
        this.loader.remove()

        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
            new Labels({labels: Array.from(this.series, x => x['name']), isDivergent: true}).render($)
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
                chartHeightFraction: 4,
                isDivergent: true
            }).render($)
        })
    }

    async refresh() {
        try {
            this.series = getSeriesData((await this.analysisCache.get(true)).series, 'temperature')
        } catch (e) {
            // Let the parent view handle network failures
        }

        if (this.series.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/gpu_temp`)
    }
}
