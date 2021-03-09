import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {AnalysisDataModel} from "../../../models/run"
import {Card, CardOptions} from "../../types"
import {AnalysisDataCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"
import parametersCache from "./cache"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'


export class ParametersCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    analysisCache: AnalysisDataCache
    elem: WeyaElement
    lineChartContainer: WeyaElement
    loader: Loader

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = parametersCache.getAnalysis(this.uuid)
        this.loader = new Loader()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Parameters')
        })

        this.elem.appendChild(this.loader.render($))
        try {
            this.analysisData = await this.analysisCache.get()
        } catch (e) {
            // Let the parent view handle network failures
        }
        this.loader.remove()

        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
        })

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
        try {
            this.analysisData = await this.analysisCache.get(true)
        } catch (e) {
            // Let the parent view handle network failures
        }

        if (this.analysisData.summary.length > 0) {
            this.renderLineChart()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/params`)
    }
}
