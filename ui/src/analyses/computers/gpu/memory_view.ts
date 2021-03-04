import {ScreenView} from "../../../screen"
import {SeriesModel} from "../../../models/run"
import CACHE, {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import {Loader} from "../../../components/loader"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton, RefreshButton, SaveButton} from "../../../components/buttons"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import gpuCache from "./cache"
import {ComputerHeaderCard} from '../computer_header/card'
import {TimeSeriesChart} from '../../../components/charts/timeseries/chart'
import {SparkTimeLines} from '../../../components/charts/spark_time_lines/chart'
import mix_panel from "../../../mix_panel"
import {getSeriesData} from "./utils"
import {handleNetworkError} from '../../../utils/redirect';
import Timeout = NodeJS.Timeout;

const AUTO_REFRESH_TIME = 2 * 60 * 1000

class GPUMemoryView extends ScreenView {
    elem: WeyaElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    statusCache: ComputerStatusCache
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    preferenceCache: SeriesPreferenceCache
    loader: Loader
    refreshButton: RefreshButton
    computerHeaderCard: ComputerHeaderCard
    sparkTimeLines: SparkTimeLines
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    saveButtonContainer: WeyaElement
    saveButton: SaveButton
    isUpdateDisable: boolean
    actualWidth: number
    autoRefresh: Timeout
    GPUView: HTMLDivElement
    lastVisibilityChange: number

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.analysisCache = gpuCache.getAnalysis(this.uuid)
        this.preferenceCache = gpuCache.getPreferences(this.uuid)

        this.isUpdateDisable = true
        this.loader = new Loader(true)
        this.saveButton = new SaveButton({onButtonClick: this.updatePreferences, parent: this.constructor.name})

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
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
                this.GPUView = <HTMLDivElement>$('div', '')
                this.loader.render($)
            })

        this.loadData().then(() => {
            this.loader.remove()

            if (this.status && this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
            }

            this.loadPreferences()

            this.renderGpu()
        }).catch(() => {
        })

        return this.elem
    }

    async loadData() {
        try {
            this.series = getSeriesData((await this.analysisCache.get(true)).series, 'memory')
            this.status = await this.statusCache.get()
            this.preferenceData = await this.preferenceCache.get()
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
        if (this.computerHeaderCard) {
            this.computerHeaderCard.clearCounter()
        }
    }

    async onRefresh() {
        try {
            this.series = getSeriesData((await this.analysisCache.get(true)).series, 'memory')
            this.status = await this.statusCache.get(true)
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        this.renderSparkLines()
        this.renderLineChart()
        this.computerHeaderCard.refresh().then()
    }

    onVisibilityChange() {
        let currentTime = Date.now()
        if (document.hidden) {
            this.lastVisibilityChange = currentTime
            clearInterval(this.autoRefresh)
        } else {
            if (this.status.isRunning) {
                setTimeout(args => {
                    this.onRefresh().then()
                    this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
                }, Math.max(0, (this.lastVisibilityChange + AUTO_REFRESH_TIME) - currentTime))
            }
        }
    }

    renderGpu() {
        this.GPUView.innerHTML = ''

        $(this.GPUView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Session', parent: this.constructor.name}).render($)
                this.saveButtonContainer = $('div')
                if (this.status && this.status.isRunning) {
                    this.refreshButton = new RefreshButton({
                        onButtonClick: this.onRefresh.bind(this),
                        parent: this.constructor.name
                    })
                    this.refreshButton.render($)
                }
            })
            this.computerHeaderCard = new ComputerHeaderCard({
                uuid: this.uuid,
                width: this.actualWidth
            })
            this.computerHeaderCard.render($).then()
            $('h2.header.text-center', 'GPU - Memory')
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
            new TimeSeriesChart({
                series: this.series,
                width: this.actualWidth,
                plotIdx: this.plotIdx,
                onCursorMove: [this.sparkTimeLines.changeCursorValues],
                isCursorMoveOpt: true
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        $(this.sparkLinesContainer, $ => {
            this.sparkTimeLines = new SparkTimeLines({
                series: this.series,
                plotIdx: this.plotIdx,
                width: this.actualWidth,
                onSelect: this.toggleChart
            })
            this.sparkTimeLines.render($)
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
        let analysisPreferences = this.preferenceData.sub_series_preferences['memory']
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

    updatePreferences = () => {
        this.preferenceData.sub_series_preferences['memory'] = this.plotIdx
        this.preferenceCache.setPreference(this.preferenceData).then()

        this.isUpdateDisable = true
        this.renderSaveButton()
    }
}


export class GPUMemoryHandler {
    constructor() {
        ROUTER.route('session/:uuid/gpu_memory', [this.handleGPU])
    }

    handleGPU = (uuid: string) => {
        SCREEN.setView(new GPUMemoryView(uuid))
    }
}
