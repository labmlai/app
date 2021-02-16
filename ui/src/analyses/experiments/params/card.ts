import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {AnalysisCache} from "../../helpers"
import {SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {RunStatusCache} from "../../../cache/cache"
import {SimpleLinesChart} from "../../../components/charts/simple_lines/chart"

class ParameterAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'parameters', statusCache)
    }
}

class ParameterPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'parameters')
    }
}

export class Parameters extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    cache: AnalysisCache<ParameterAnalysisCache, ParameterPreferenceCache>
    analysisCache: SeriesCache

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.cache = new AnalysisCache(ParameterAnalysisCache, ParameterPreferenceCache)
        this.analysisCache = this.cache.getAnalysis(this.uuid)
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.analysisData = await this.analysisCache.get()

        $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Parameters')
            new SimpleLinesChart({series: this.analysisData.summary, width: this.width}).render($)
        })
    }

    onClick = () => {
        // ROUTER.navigate(`/parameters/${this.uuid}`)
    }
}