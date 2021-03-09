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
    private _load: () => Promise<void>;
    private loaded: boolean;
    private loader: Loader;
    private elem: HTMLDivElement;
    private errorMessage: ErrorMessage;

    constructor(load: () => Promise<void>) {
        this._load = load
        this.loaded = false
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    render(parent: HTMLElement) {
        Weya(parent, $ => {
            this.elem = $('div', '.data-loader')
        })
    }

    async load() {
        this.errorMessage.remove()
        if (!this.loaded) {
            this.elem.appendChild(this.loader.render(Weya))
            await waitForFrame()
        }

        try {
            await this._load()
            this.loaded = true
        } catch (e) {
            this.errorMessage.render(this.elem)
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
    preferenceCache: AnalysisPreferenceCache
    plotIdx: number[] = []
    loader: DataLoader


    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = metricsCache.getAnalysis(this.uuid)
        this.preferenceCache = metricsCache.getPreferences(this.uuid)
        this.loader = new DataLoader(async () => {
            this.series = toPointValues((await this.analysisCache.get()).series)
            this.preferenceData = await this.preferenceCache.get()
        })
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Metrics')
        })

        this.loader.render(this.elem)

        try {
            await this.loader.load()

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
            await this.loader.load()
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
