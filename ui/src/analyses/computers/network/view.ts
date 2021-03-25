import {ScreenView} from "../../../screen"
import {SeriesModel} from "../../../models/run"
import CACHE, {AnalysisDataCache, AnalysisPreferenceCache, ComputerStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import {DataLoader} from "../../../components/loader"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton, SaveButton} from "../../../components/buttons"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import networkCache from "./cache"
import {toPointValues} from "../../../components/charts/utils"
import {ComputerHeaderCard} from '../computer_header/card'
import {TimeSeriesChart} from '../../../components/charts/timeseries/chart'
import {SparkTimeLines} from '../../../components/charts/spark_time_lines/chart'
import mix_panel from "../../../mix_panel"
import {ViewHandler} from "../../types"
import {AwesomeRefreshButton} from '../../../components/refresh_button'

class NetworkView extends ScreenView {
    elem: HTMLDivElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    statusCache: ComputerStatusCache
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: AnalysisDataCache
    preferenceCache: AnalysisPreferenceCache
    computerHeaderCard: ComputerHeaderCard
    sparkTimeLines: SparkTimeLines
    lineChartContainer: HTMLDivElement
    sparkLinesContainer: HTMLDivElement
    saveButtonContainer: HTMLDivElement
    saveButton: SaveButton
    isUpdateDisable: boolean
    actualWidth: number
    private loader: DataLoader
    private refresh: AwesomeRefreshButton

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.analysisCache = networkCache.getAnalysis(this.uuid)
        this.preferenceCache = networkCache.getPreferences(this.uuid)

        this.isUpdateDisable = true
        this.saveButton = new SaveButton({onButtonClick: this.updatePreferences, parent: this.constructor.name})

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.series = toPointValues((await this.analysisCache.get(force)).series)
            this.preferenceData = await this.preferenceCache.get(force)
        })
        this.refresh = new AwesomeRefreshButton(this.onRefresh.bind(this))

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)

        if (this.elem) {
            this._render().then()
        }
    }

    async _render() {
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.page',
                {style: {width: `${this.actualWidth}px`}},
                $ => {
                    $('div', $ => {
                        $('div', '.nav-container', $ => {
                            new BackButton({text: 'Session', parent: this.constructor.name}).render($)
                            this.saveButtonContainer = $('div')
                            this.refresh.render($)
                        })
                        this.computerHeaderCard = new ComputerHeaderCard({
                            uuid: this.uuid,
                            width: this.actualWidth
                        })
                        this.computerHeaderCard.render($).then()
                        $('h2', '.header.text-center', 'Network')
                        this.loader.render($)
                        $('div', '.detail-card', $ => {
                            this.lineChartContainer = $('div', '.fixed-chart')
                            this.sparkLinesContainer = $('div')
                        })
                    })
                })
        })

        try {
            await this.loader.load()

            this.calcPreferences()

            this.renderSparkLines()
            this.renderLineChart()
            this.renderSaveButton()

        } catch (e) {

        } finally {
            if (this.status && this.status.isRunning) {
                this.refresh.attachHandler(this.computerHeaderCard.renderLastRecorded.bind(this.computerHeaderCard))
                this.refresh.start()
            }
        }
    }

    render(): WeyaElement {
        this.elem = $('div')

        this._render().then()

        return this.elem
    }

    destroy() {
        this.refresh.stop()
    }

    async onRefresh() {
        try {
            await this.loader.load(true)

            this.calcPreferences()
            this.renderSparkLines()
            this.renderLineChart()
        } catch (e) {

        } finally {
            if (this.status && !this.status.isRunning) {
                this.refresh.stop()
            }

            this.computerHeaderCard.refresh().then()
        }
    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
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
                isCursorMoveOpt: true,
                isDivergent: true
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
                onSelect: this.toggleChart,
                isDivergent: true
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

    calcPreferences() {
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

    updatePreferences = () => {
        this.preferenceData.series_preferences = this.plotIdx
        this.preferenceCache.setPreference(this.preferenceData).then()

        this.isUpdateDisable = true
        this.renderSaveButton()
    }
}

export class NetworkHandler extends ViewHandler {
    constructor() {
        super()
        ROUTER.route('session/:uuid/network', [this.handleNetwork])
    }

    handleNetwork = (uuid: string) => {
        SCREEN.setView(new NetworkView(uuid))
    }
}
