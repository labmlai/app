import {ScreenView} from "../../../screen"
import {AnalysisDataModel} from "../../../models/run"
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
import {getChartType} from "../../../components/charts/utils"


class MetricsView extends ScreenView {
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

        this.isUpdateDisable = false
        this.loader = new Loader()
    }

    get requiresAuth(): boolean {
        return false
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

        this.renderMetrics()
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

        this.loaData().then(() => {
            if (this.status && this.status.isRunning) {
                this.autoRefresh = setInterval(this.renderMetrics.bind(this), 2 * 60 * 1000)
            }

            this.loadPreferences()

            this.renderMetrics()
        })

        return this.elem
    }

    async loaData() {
        this.analysisData = await this.analysisCache.get()
        this.status = await this.statusCache.get()
        this.preferenceData = await this.preferenceCache.get()

        this.loader.remove()
    }

    renderMetrics() {
        this.metricsView.innerHTML = ''

        $(this.metricsView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                new SaveButton({onButtonClick: this.updatePreferences, isDisabled: this.isUpdateDisable}).render($)
                if (this.status && this.status.isRunning) {
                    new RefreshButton({onButtonClick: this.onRefresh}).render($)
                }
            })
            new RunHeaderCard({uuid: this.uuid, width: this.actualWidth}).render($)
            $('h2.header.text-center', 'Metrics')
            new ToggleButton({
                onButtonClick: this.onChangeScale,
                text: 'Log',
                isToggled: this.currentChart > 0
            }).render($)
            $('div.detail-card', $ => {
                $('div.fixed-chart', $ => {
                    new LineChart({
                        series: this.analysisData.series,
                        width: this.actualWidth,
                        plotIdx: this.plotIdx,
                        chartType: getChartType(this.currentChart)
                    }).render($)
                })
                new SparkLines({
                    series: this.analysisData.series,
                    plotIdx: this.plotIdx,
                    width: this.actualWidth,
                    onSelect: this.toggleChart
                }).render($)
            })
        })
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
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

        this.renderMetrics()
    }

    updatePreferences = () => {
        this.preferenceData.series_preferences = this.plotIdx
        this.preferenceData.chart_type = this.currentChart
        this.preferenceCache.setPreference(this.preferenceData).then()

        this.isUpdateDisable = true
    }

    onRefresh = () => {

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
