import {Weya, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {AnalysisDataModel} from "../../../models/run"
import {Card, CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"
import activationsCache from "./cache"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'
import {ErrorMessage} from '../../../components/error_message'

export class ActivationsCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    analysisCache: SeriesCache
    lineChartContainer: HTMLDivElement
    elem: HTMLDivElement
    loader: Loader
    errorMessage: ErrorMessage

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = activationsCache.getAnalysis(this.uuid)
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3', '.header', 'Activations')
        })

        this.elem.appendChild(this.loader.render($))

        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
        })

        try {
            this.analysisData = await this.analysisCache.get()
        } catch (e) {
            this.loader.remove()
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.analysisData.summary.length > 0) {
            this.renderLineChart()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        Weya(this.lineChartContainer, $ => {
            new SimpleLinesChart({series: this.analysisData.summary, width: this.width}).render($)
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
            this.analysisData = await this.analysisCache.get(true)
        } catch (e) {
            this.loader.remove()
            this.lineChartContainer.innerHTML = ''
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.analysisData.summary.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/outputs`)
    }
}
