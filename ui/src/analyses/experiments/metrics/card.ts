import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
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
    AnalysisData: AnalysisDataModel
    analysisCache: SeriesCache

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = new AnalysisCache(MetricsAnalysisCache, MetricsPreferenceCache).getAnalysis(this.uuid)
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.AnalysisData = await this.analysisCache.get()

        $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Metrics')
            new LineChart({series: this.AnalysisData.series, width: this.width, plotIdx: [], chartType: 'linear'}).render($)
        })
    }

    onClick = () => {
        // ROUTER.navigate(`/gradients/${this.uuid}`)
    }
}