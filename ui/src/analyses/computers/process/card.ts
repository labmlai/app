import {Weya, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import {Card, CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {toPointValues} from "../../../components/charts/utils"
import {Loader} from "../../../components/loader"
import processCache from './cache'
import {TimeSeriesChart} from '../../../components/charts/timeseries/chart'
import {ROUTER} from '../../../app'
import {ErrorMessage} from '../../../components/error_message'

export class ProcessCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    analysisCache: SeriesCache
    lineChartContainer: HTMLDivElement
    elem: HTMLDivElement
    loader: Loader
    errorMessage: ErrorMessage

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = processCache.getAnalysis(this.uuid)
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3', '.header', 'Process')
        })

        this.elem.appendChild(this.loader.render($))

        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
        })

        try {
            this.series = toPointValues((await this.analysisCache.get()).series)
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
        this.lineChartContainer.innerHTML = ''
        Weya(this.lineChartContainer, $ => {
            new TimeSeriesChart({
                series: this.series,
                width: this.width,
                plotIdx: [],
                chartHeightFraction: 4
            }).render($)
        })
    }

    async refresh() {
        if (this.errorMessage.isVisible) {
            this.errorMessage.remove()
            Weya(this.elem, $ => {
                this.loader.render($)
            })
        }
        try {
            this.series = toPointValues((await this.analysisCache.get(true)).series)
        } catch (e) {
            this.loader.remove()
            this.lineChartContainer.innerHTML = ''
            this.errorMessage.render(this.elem)
            return
        }

        if (this.series.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/process`)
    }
}
