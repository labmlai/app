import {ScreenView} from "../../../screen"
import {SeriesModel} from "../../../models/run"
import CACHE, {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import {Loader} from "../../../components/loader"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton, RefreshButton, SaveButton, ToggleButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import metricsCache from "./cache"
import Timeout = NodeJS.Timeout
import {LineChart} from "../../../components/charts/lines/chart"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import {getChartType, toPointValues} from "../../../components/charts/utils"


class MetricsView extends ScreenView {
    elem: WeyaElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    currentChart: number
    statusCache: RunStatusCache
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    preferenceCache: SeriesPreferenceCache
    loader: Loader
    refreshButton: RefreshButton
    runHeaderCard: RunHeaderCard
    sparkLines: SparkLines
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    saveButtonContainer: WeyaElement
    saveButton: SaveButton
    isUpdateDisable: boolean
    actualWidth: number
    autoRefresh: Timeout
    metricsView: HTMLDivElement

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.currentChart = 0
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.analysisCache = metricsCache.getAnalysis(this.uuid)
        this.preferenceCache = metricsCache.getPreferences(this.uuid)

        this.isUpdateDisable = true
        this.loader = new Loader(true)
        this.saveButton = new SaveButton({onButtonClick: this.updatePreferences})
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
        this.series = toPointValues((await this.analysisCache.get()).series)
        this.status = await this.statusCache.get()
        this.preferenceData = await this.preferenceCache.get()
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
        this.runHeaderCard.clearCounter()
    }

    async onRefresh() {
        this.series = toPointValues((await this.analysisCache.get(true)).series)
        this.status = await this.statusCache.get(true)

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        this.renderSparkLines()
        this.renderLineChart()
        this.runHeaderCard.refresh().then()
    }

    renderMetrics() {
        this.metricsView.innerHTML = ''

        $(this.metricsView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run'}).render($)
                this.saveButtonContainer = $('div')
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
            new ToggleButton({
                onButtonClick: this.onChangeScale,
                text: 'Log',
                isToggled: this.currentChart > 0
            }).render($)
            $('h2.header.text-center', 'Metrics')
            $('div.detail-card', $ => {
                this.lineChartContainer = $('div.fixed-chart')
                this.sparkLinesContainer = $('div')
            })
        })

        this.renderSparkLines()
        this.renderLineChart()
        this.renderSaveButton()
    }

    renderSaveButton() {
        this.saveButton.disabled = this.isUpdateDisable
        this.saveButtonContainer.innerHTML = ''
        $(this.saveButtonContainer, $ => {
            this.saveButton.render($)
        })
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        $(this.lineChartContainer, $ => {
            new LineChart({
                series: this.series,
                width: this.actualWidth,
                plotIdx: this.plotIdx,
                chartType: getChartType(this.currentChart),
                onCursorMove: [this.sparkLines.changeCursorValues],
                isCursorMoveOpt: true
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        $(this.sparkLinesContainer, $ => {
            this.sparkLines = new SparkLines({
                series: this.series,
                plotIdx: this.plotIdx,
                width: this.actualWidth,
                onSelect: this.toggleChart
            })
            this.sparkLines.render($)
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

        this.renderSparkLines()
        this.renderLineChart()
        this.renderSaveButton()
    }

    loadPreferences() {
        this.currentChart = this.preferenceData.chart_type

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences && analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        } else if (this.series) {
            let res: number[] = []
            for (let i = 0; i < this.series.length; i++) {
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
        this.renderSaveButton()
    }
}


export class MetricsHandler {
    constructor() {
        ROUTER.route('metrics/:uuid', [this.handleMetrics])
    }

    handleMetrics = (uuid: string) => {
        SCREEN.setView(new MetricsView(uuid))
    }
}
