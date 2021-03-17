import {Weya, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import {StatusView} from "../../../components/status"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {DataLoader} from "../../../components/loader"

interface RunHeaderOptions extends CardOptions {
    lastUpdated?: number
}

export class RunHeaderCard {
    run: Run
    uuid: string
    status: Status
    lastUpdated: number
    runCache: RunCache
    elem: HTMLDivElement
    lastRecordedContainer: HTMLDivElement
    lastUpdatedContainer: HTMLDivElement
    statusViewContainer: HTMLDivElement
    autoRefresh: number
    statusCache: RunStatusCache
    private loader: DataLoader

    constructor(opt: RunHeaderOptions) {
        this.uuid = opt.uuid
        this.lastUpdated = opt.lastUpdated
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.lastUpdated = opt.lastUpdated ? opt.lastUpdated : this.statusCache.lastUpdated

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.run = await this.runCache.get(force)
        })
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            this.loader.render($)
        })

        try {
            await this.loader.load()

            if (this.status.isRunning) {
                this.autoRefresh = window.setInterval(this.setCounter.bind(this), 1000)
            }

            Weya(this.elem, $ => {
                $('div', $ => {
                    this.lastRecordedContainer = $('div')
                    $('div.run-info', $ => {
                        this.statusViewContainer = $('div')
                        $('h3', `${this.run.name}`)
                        $('h5', `${this.run.comment}`)
                        this.lastUpdatedContainer = $('div')
                    })
                })
            })

            this.renderStatusView()
            this.renderLastRecorded()
        } catch (e) {
            console.error(e)
        }
    }

    renderLastRecorded() {
        let lastRecorded = this.status.last_updated_time

        this.lastRecordedContainer.innerHTML = ''
        Weya(this.lastRecordedContainer, $ => {
            $('div.last-updated.mb-2', `Last Recorded ${this.status.isRunning ?
                    getTimeDiff(lastRecorded * 1000) : 'on ' + formatTime(lastRecorded)}`)
        })
    }

    renderLastUpdated() {
        this.lastUpdatedContainer.innerHTML = ''
        Weya(this.lastUpdatedContainer, $ => {
            if (this.status.isRunning) {
                $('div.last-updated.text-info', `${getTimeDiff(this.lastUpdated)}`)
            }
        })
    }

    renderStatusView() {
        this.statusViewContainer.innerHTML = ''
        Weya(this.statusViewContainer, $ => {
            new StatusView({status: this.status.run_status}).render($)
        })
    }

    clearCounter() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
    }

    setCounter() {
        this.renderLastRecorded()
        this.renderLastUpdated()
    }

    async refresh(lastUpdated?: number) {
        try {
            await this.loader.load(true)

            this.lastUpdated = lastUpdated ? lastUpdated : this.statusCache.lastUpdated

            this.renderStatusView()
            this.renderLastRecorded()
            this.renderLastUpdated()

            if (!this.status.isRunning) {
                this.clearCounter()
            }
        } catch (e) {
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/header`)
    }
}
