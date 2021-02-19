import {WeyaElementFunction, Weya, WeyaElement,} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"
import parametersCache from "./cache"
import {Loader} from "../../../components/loader"


export class ParametersCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    analysisCache: SeriesCache
    elem: WeyaElement
    lineChartContainer: WeyaElement
    loader: Loader

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = parametersCache.getAnalysis(this.uuid)
        this.loader = new Loader()
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Parameters')
        })

        this.elem.appendChild(this.loader.render($))
        this.analysisData = await this.analysisCache.get()
        this.loader.remove()

        if (this.analysisData.summary.length > 0) {
            Weya(this.elem, $ => {
                this.lineChartContainer = $('div', '')
            })

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

    onClick = () => {
        ROUTER.navigate(`/parameters/${this.uuid}`)
    }
}