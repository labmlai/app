import {WeyaElementFunction, Weya, WeyaElement,} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {SeriesCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"
import gradientsCache from "./cache"

export class GradientsCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    analysisCache: SeriesCache
    elem: WeyaElement

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = gradientsCache.getAnalysis(this.uuid)
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}})

        this.analysisData = await this.analysisCache.get()

        Weya(this.elem, $ => {
            $('h3.header', 'Gradients')
            new SimpleLinesChart({series: this.analysisData.summary, width: this.width}).render($)
        })
    }

    onClick = () => {
        // ROUTER.navigate(`/gradients/${this.uuid}`)
    }
}