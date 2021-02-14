import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {AnalysisCache} from "../../helpers"
import {SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {RunStatusCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"

class GradientAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'gradients', statusCache)
    }
}

class GradientPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gradients')
    }
}

export class Gradients extends Card {
    uuid: string
    width: number
    AnalysisData: AnalysisDataModel
    analysisCache: SeriesCache

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = new AnalysisCache(GradientAnalysisCache, GradientPreferenceCache).getAnalysis(this.uuid)
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.AnalysisData = await this.analysisCache.get()

        $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Gradients')
            new SimpleLinesChart({series: this.AnalysisData.summary, width: this.width}).render($)
        })
    }

    onClick = () => {
        // ROUTER.navigate(`/gradients/${this.uuid}`)
    }
}