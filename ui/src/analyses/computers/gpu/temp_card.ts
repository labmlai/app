import {SeriesModel} from "../../../models/run"
import {SeriesCache} from "../../../cache/cache"
import {Weya, WeyaElementFunction} from "../../../../../lib/weya/weya"
import {Loader} from "../../../components/loader"
import {Card, CardOptions} from "../../types"
import gpuCache from "./cache"
import {getSeriesData} from "./utils"
import {Labels} from "../../../components/charts/labels"
import {TimeSeriesChart} from "../../../components/charts/timeseries/chart"
import {ROUTER} from "../../../app"
import {ErrorMessage} from '../../../components/error_message'

export class GPUTempCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    analysisCache: SeriesCache
    lineChartContainer: HTMLDivElement
    rootContainer: HTMLDivElement
    elem: HTMLDivElement
    loader: Loader
    plotIdx: number[] = []
    errorMessage: ErrorMessage
    labels: Labels

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = gpuCache.getAnalysis(this.uuid)
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3', '.header', 'GPU - Temperature')
            this.rootContainer = $('div')
        })

        this.elem.appendChild(this.loader.render($))

        Weya(this.rootContainer, $ => {
            this.lineChartContainer = $('div', '')
        })

        try {
            this.series = getSeriesData((await this.analysisCache.get()).series, 'temperature')
        } catch (e) {
            this.loader.remove()
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

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
                chartHeightFraction: 4
            }).render($)
        })
        if (!this.labels) {
            Weya(this.rootContainer, $ => {
                this.labels = new Labels({labels: Array.from(this.series, x => x['name'])})
                this.labels.render($)
            })
        }
    }

    async refresh() {
        if (this.errorMessage.isVisible) {
            this.errorMessage.remove()
            Weya(this.elem, $ => {
                this.loader.render($)
            })
        }
        try {
            this.series = getSeriesData((await this.analysisCache.get(true)).series, 'temperature')
        } catch (e) {
            this.loader.remove()
            this.rootContainer.classList.add('hide')
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.series.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
            this.rootContainer.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/gpu_temp`)
    }
}
