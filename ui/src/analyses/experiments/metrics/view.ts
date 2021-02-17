import {ScreenView} from "../../../screen"
import {AnalysisDataModel, Run} from "../../../models/run"
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
import {getChartType} from "../../../components/charts/utils"
import {a} from "../../../../../../../opt/anaconda3/lib/python3.7/site-packages/bokeh/server/static/js/types/core/dom";


class MetricsView extends ScreenView {
    elem: WeyaElement
    uuid: string
    run: Run
    status: Status
    plotIdx: number[] = []
    currentChart: number
    statusCache: RunStatusCache
    analysisData: AnalysisDataModel
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    preferenceCache: SeriesPreferenceCache
    loader: Loader
    actualWidth: number
    autoRefresh: Timeout
    metricsView: HTMLDivElement

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.currentChart = 1
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.analysisCache = metricsCache.getAnalysis(this.uuid)
        this.preferenceCache = metricsCache.getPreferences(this.uuid)

        this.loader = new Loader()
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

        this.renderMetrics().then()

        return this.elem
    }


    async renderMetrics() {
        this.analysisData = await this.analysisCache.get()
        this.status = await this.statusCache.get()
        this.preferenceData = await this.preferenceCache.get()

        this.loader.remove()

        this.loadPreferences()

        if (this.status && this.status.isRunning) {
            this.autoRefresh = setInterval(this.renderMetrics.bind(this), 2 * 60 * 1000)
        }

        this.metricsView.innerHTML = ''

        $(this.metricsView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                new SaveButton({onButtonClick: this.updatePreferences}).render($)
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
            $('div', $ => {
                new LineChart({
                    series: this.analysisData.series,
                    width: this.actualWidth,
                    plotIdx: this.plotIdx,
                    chartType: getChartType(this.currentChart)
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
        if (this.currentChart === 1) {
            this.currentChart = 0
        } else {
            this.currentChart = this.currentChart + 1
        }
    }

    updatePreferences = () => {
        this.preferenceData.series_preferences = this.plotIdx
        this.preferenceData.chart_type = this.currentChart
        this.preferenceCache.setPreference(this.preferenceData).then()
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
