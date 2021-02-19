import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import CACHE, {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisDataModel} from "../../../models/run"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import {Loader} from "../../../components/loader"
import {BackButton, RefreshButton, SaveButton, ToggleButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import gradientsCache from "./cache"
import {LineChart} from "../../../components/charts/lines/chart"
import {getChartType} from "../../../components/charts/utils"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import Timeout = NodeJS.Timeout
import {ScreenView} from "../../../screen"
import {ROUTER, SCREEN} from "../../../app"


class GradientsView extends ScreenView {
    elem: WeyaElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    currentChart: number
    statusCache: RunStatusCache
    analysisData: AnalysisDataModel
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    preferenceCache: SeriesPreferenceCache
    loader: Loader
    refreshButton: RefreshButton
    runHeaderCard: RunHeaderCard
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    isUpdateDisable: boolean
    actualWidth: number
    autoRefresh: Timeout
    metricsView: HTMLDivElement

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.currentChart = 0
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.analysisCache = gradientsCache.getAnalysis(this.uuid)
        this.preferenceCache = gradientsCache.getPreferences(this.uuid)

        this.isUpdateDisable = false
        this.loader = new Loader()
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)
    }

    render(): WeyaElement {
        this.elem = <HTMLElement>$('div.page',
            {style: {width: `${this.actualWidth}px`}},
            $ => {
                this.metricsView = <HTMLDivElement>$('div', '')
                this.loader.render($)
            })

        this.loadData().then(() => {
            this.loader.remove()

            if (this.status && this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), 2 * 60 * 1000)
            }

            this.loadPreferences()

            this.renderMetrics()
        })

        return this.elem
    }

    async loadData() {
        this.analysisData = await this.analysisCache.get()
        this.status = await this.statusCache.get()
        this.preferenceData = await this.preferenceCache.get()
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
    }

    async onRefresh() {
        this.analysisData = await this.analysisCache.get(true)
        this.status = await this.statusCache.get()

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        this.renderLineChart()
        this.renderSparkLines()
        this.runHeaderCard.refresh().then()
    }

    renderMetrics() {
        this.metricsView.innerHTML = ''

        $(this.metricsView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                new SaveButton({onButtonClick: this.updatePreferences, isDisabled: this.isUpdateDisable}).render($)
                if (this.status && this.status.isRunning) {
                    this.refreshButton = new RefreshButton({onButtonClick: this.onRefresh.bind(this)})
                    this.refreshButton.render($)
                }
            })
            this.runHeaderCard = new RunHeaderCard({
                uuid: this.uuid,
                width: this.actualWidth
            })
            this.runHeaderCard.render($).then()
            $('h2.header.text-center', 'Gradients')
            new ToggleButton({
                onButtonClick: this.onChangeScale,
                text: 'Log',
                isToggled: this.currentChart > 0
            }).render($)
            $('div.detail-card', $ => {
                this.lineChartContainer = $('div.fixed-chart')
                this.sparkLinesContainer = $('div')
            })
        })

        this.renderLineChart()
        this.renderSparkLines()
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        $(this.lineChartContainer, $ => {
            new LineChart({
                series: this.analysisData.series,
                width: this.actualWidth,
                plotIdx: this.plotIdx,
                chartType: getChartType(this.currentChart)
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        $(this.sparkLinesContainer, $ => {
            new SparkLines({
                series: this.analysisData.series,
                plotIdx: this.plotIdx,
                width: this.actualWidth,
                onSelect: this.toggleChart
            }).render($)
        })
    }

    toggleChart = (idx: number) => {
        this.isUpdateDisable = false

        if (this.plotIdx[idx] >= 0) {
            this.plotIdx[idx] = -1
        } else {
            this.plotIdx[idx] = Math.max(...this.plotIdx) + 1
        }

        if (this.plotIdx.length > 1) {
            this.plotIdx = new Array<number>(...this.plotIdx)
        }

        this.renderLineChart()
        this.renderSparkLines()
    }

    loadPreferences() {
        this.currentChart = this.preferenceData.chart_type

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences && analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        } else if (this.analysisData.series) {
            let res: number[] = []
            for (let i = 0; i < this.analysisData.series.length; i++) {
                res.push(i)
            }
            this.plotIdx = res
        }
    }

    onChangeScale = () => {
        this.isUpdateDisable = false

        if (this.currentChart === 1) {
            this.currentChart = 0
        } else {
            this.currentChart = this.currentChart + 1
        }

        this.renderLineChart()
    }

    updatePreferences = () => {
        this.preferenceData.series_preferences = this.plotIdx
        this.preferenceData.chart_type = this.currentChart
        this.preferenceCache.setPreference(this.preferenceData).then()

        this.isUpdateDisable = true
    }
}

export class GradientsHandler {
    constructor() {
        console.log('ll')
        ROUTER.route('gradients/:uuid', [this.handleGradients])
    }

    handleGradients = (uuid: string) => {
        SCREEN.setView(new GradientsView(uuid))
    }
}