import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import Card from "../../card"
import {CardOptions} from "../../types"
import {AnalysisCache} from "../../helpers"
import {SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {RunStatusCache} from "../../../cache/cache"
import {LineChart} from "../../../components/charts/lines/chart"

class MetricsAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'metrics', statusCache)
    }
}

class MetricsPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'metrics')
    }
}

export class Metrics extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    cache: AnalysisCache<MetricsAnalysisCache, MetricsPreferenceCache>
    preferenceCache: SeriesPreferenceCache


    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.cache = new AnalysisCache(MetricsAnalysisCache, MetricsPreferenceCache)
        this.analysisCache = this.cache.getAnalysis(this.uuid)
        this.preferenceCache = this.cache.getPreferences(this.uuid)
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.analysisData = await this.analysisCache.get()
        this.preferenceData = await this.preferenceCache.get()

        $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Metrics')
            new LineChart({
                series: this.analysisData.series,
                width: this.width,
                plotIdx: [],
                chartType: 'linear'
            }).render($)
        })
    }

    onClick = () => {
        // ROUTER.navigate(`/gradients/${this.uuid}`)
    }
}