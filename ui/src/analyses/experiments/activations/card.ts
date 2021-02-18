import {WeyaElementFunction, Weya, WeyaElement} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"
import activationsCache from "./cache"
import {Loader} from "../../../components/loader"


export class ActivationsCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    analysisCache: SeriesCache
    loader: Loader
    elem: WeyaElement

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = activationsCache.getAnalysis(this.uuid)
        this.loader = new Loader()
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Activations')
        })

        this.elem.appendChild(this.loader.render($))
        this.analysisData = await this.analysisCache.get()
        this.loader.remove()

        if (this.analysisData.summary.length > 0) {
            Weya(this.elem, $ => {
                new SimpleLinesChart({series: this.analysisData.summary, width: this.width}).render($)
            })
        } else {
            this.elem.remove()
        }
    }

    onClick = () => {
        // ROUTER.navigate(`/gradients/${this.uuid}`)
    }
}