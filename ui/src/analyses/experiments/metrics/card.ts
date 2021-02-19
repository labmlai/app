import {WeyaElementFunction, Weya, WeyaElement,} from '../../../../../lib/weya/weya'
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
import {Loader} from "../../../components/loader"


export class MetricsCard extends Card {
    uuid: string
    width: number
    analysisData: AnalysisDataModel
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    elem: WeyaElement
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    preferenceCache: SeriesPreferenceCache
    plotIdx: number[] = []
    loader: Loader


    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = metricsCache.getAnalysis(this.uuid)
        this.preferenceCache = metricsCache.getPreferences(this.uuid)
        this.loader = new Loader()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Metrics')
        })

        this.elem.appendChild(this.loader.render($))
        this.analysisData = await this.analysisCache.get()
        this.preferenceData = await this.preferenceCache.get()
        this.loader.remove()

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        }


        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
            this.sparkLinesContainer = $('div', '')
        })

        if (this.analysisData.series.length > 0) {
            this.renderLineChart()
            this.renderSparkLines()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        Weya(this.lineChartContainer, $ => {
            new LineChart({
                series: this.analysisData.series,
                width: this.width,
                plotIdx: this.plotIdx,
                chartType: this.preferenceData && this.preferenceData.chart_type ?
                    getChartType(this.preferenceData.chart_type) : 'linear'
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        Weya(this.sparkLinesContainer, $ => {
            new SparkLines({
                series: this.analysisData.series,
                plotIdx: this.plotIdx,
                width: this.width
            }).render($)
        })
    }

    async refresh() {
        this.analysisData = await this.analysisCache.get(true)

        if (this.analysisData.series.length > 0) {
            this.renderLineChart()
            this.renderSparkLines()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/metrics/${this.uuid}`)
    }
}