import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {AnalysisDataModel} from "../../../models/run"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import Card from "../../card"
import {CardOptions} from "../../types"
import {SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {getChartType} from "../../../components/charts/utils"
import {LineChart} from "../../../components/charts/lines/chart"
import metricsCache from "./cache"
import {SparkLines} from "../../../components/charts/spark_lines/chart"


export class MetricsCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    preferenceCache: SeriesPreferenceCache
    plotIdx: number[] = []


    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = metricsCache.getAnalysis(this.uuid)
        this.preferenceCache = metricsCache.getPreferences(this.uuid)
    }

    refresh() {
    }

    async render($: WeyaElementFunction) {
        this.analysisData = await this.analysisCache.get()
        this.preferenceData = await this.preferenceCache.get()

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences && analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        }

        $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Metrics')
            new LineChart({
                series: this.analysisData.series,
                width: this.width,
                plotIdx: this.plotIdx,
                chartType: this.preferenceData && this.preferenceData.chart_type ?
                    getChartType(this.preferenceData.chart_type) : 'linear'
            }).render($)
            new SparkLines({
                series: this.analysisData.series,
                plotIdx: this.plotIdx,
                width: this.width
            }).render($)
        })
    }

    onClick = () => {
        ROUTER.navigate(`/metrics/${this.uuid}`)
    }
}