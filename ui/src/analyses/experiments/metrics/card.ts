import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import {Card, CardOptions} from "../../types"
import {AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {getChartType, toPointValues} from "../../../components/charts/utils"
import {LineChart} from "../../../components/charts/lines/chart"
import metricsCache from "./cache"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'

export class ErrorMessage {
    elem: HTMLDivElement

    constructor() {
        this.elem = null
    }

    render(parent: HTMLDivElement) {
        Weya(parent, $ => {
            this.elem = $('div', '.error.text-center.warning', $ => {
                $('span', '.fas.fa-exclamation-triangle', '')
                $('h4', '.text-uppercase', 'Failed to load data')
            })
        })
    }

    remove() {
        if (this.elem == null) {
            return
        }
        this.elem.remove()
        this.elem = null
    }
}

async function waitForFrame() {
    return new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
            resolve()
        })
    })
}

class DataLoader {
    private _load: (force: boolean) => Promise<void>;
    private loaded: boolean;
    private loader: Loader;
    private elem: HTMLDivElement;
    private dataContainer: HTMLDivElement
    private errorMessage: ErrorMessage;

    constructor(load: (force: boolean) => Promise<void>) {
        this._load = load
        this.loaded = false
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    render(parent: HTMLElement, dataContainer: HTMLDivElement) {
        Weya(parent, $ => {
            this.elem = $('div', '.data-loader')
        })
        this.dataContainer = dataContainer
    }

    async load(force: boolean = false) {
        this.errorMessage.remove()
        if (!this.loaded) {
            this.elem.appendChild(this.loader.render(Weya))
            await waitForFrame()
        }

        try {
            await this._load(force)
            this.loaded = true
            this.dataContainer.classList.remove('hide')
        } catch (e) {
            this.loaded = false
            this.errorMessage.render(this.elem)
            this.dataContainer.classList.add('hide')
            throw e
        } finally {
            this.loader.remove()
        }
    }
}

export class MetricsCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: AnalysisDataCache
    elem: HTMLDivElement
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    dataContainer: HTMLDivElement
    preferenceCache: AnalysisPreferenceCache
    plotIdx: number[] = []
    loader: DataLoader

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = metricsCache.getAnalysis(this.uuid)
        this.preferenceCache = metricsCache.getPreferences(this.uuid)
        this.loader = new DataLoader(async (force) => {
            this.series = toPointValues((await this.analysisCache.get(force)).series)
            this.preferenceData = await this.preferenceCache.get(force)
        })
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Metrics')
            this.dataContainer = $('div', $ => {
                this.lineChartContainer = $('div', '')
                this.sparkLinesContainer = $('div', '')
            })
        })

        this.loader.render(this.elem, this.dataContainer)

        try {
            await this.loader.load()

            let analysisPreferences = this.preferenceData.series_preferences
            if (analysisPreferences.length > 0) {
                this.plotIdx = [...analysisPreferences]
            }

            if (this.series.length > 0) {
                this.renderLineChart()
                this.renderSparkLines()
            } else {
                this.elem.classList.add('hide')
            }
        } catch (e) {
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
                isDivergent: true
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
                isDivergent: true
            }).render($)
        })
    }

    async refresh() {
        try {
            await this.loader.load(true)
            if (this.series.length > 0) {
                this.renderLineChart()
                this.renderSparkLines()
                this.elem.classList.remove('hide')
            }
        } catch (e) {
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/metrics`)
    }
}
