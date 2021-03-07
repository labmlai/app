import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import {Card, CardOptions} from "../../types"
import {SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {getChartType, toPointValues} from "../../../components/charts/utils"
import {LineChart} from "../../../components/charts/lines/chart"
import metricsCache from "./cache"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'


export class MetricsCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    elem: WeyaElement
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    preferenceCache: SeriesPreferenceCache
    plotIdx: number[] = []
    loader: Loader


    constructor(opt: CardOptions) {
        super(opt)

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
        try {
            this.series = toPointValues((await this.analysisCache.get()).series)
            this.preferenceData = await this.preferenceCache.get()
        } catch (e) {
            // Let the parent view handle network failures
        }
        this.loader.remove()

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        }


        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
            this.sparkLinesContainer = $('div', '')
        })

        if (this.series.length > 0) {
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
                series: this.series,
                width: this.width,
                plotIdx: this.plotIdx,
                chartType: this.preferenceData && this.preferenceData.chart_type ?
                    getChartType(this.preferenceData.chart_type) : 'linear',
                isDivergent : true
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        Weya(this.sparkLinesContainer, $ => {
            new SparkLines({
                series: this.series,
                plotIdx: this.plotIdx,
                width: this.width,
                isEditable: false,
                isDivergent : true
            }).render($)
        })
    }

    async refresh() {
        try {
            this.series = toPointValues((await this.analysisCache.get(true)).series)
        } catch (e) {
            // Let the parent view handle network failures
        }

        if (this.series.length > 0) {
            this.renderLineChart()
            this.renderSparkLines()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/metrics`)
    }
}
