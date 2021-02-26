import {Weya, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import {StatusView} from "../../../components/status"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Loader} from "../../../components/loader"
import Timeout = NodeJS.Timeout
import isMobile from '../../../utils/mobile';


interface RunHeaderOptions extends CardOptions {
    lastUpdated?: number
}

export class RunHeaderCard {
    run: Run
    uuid: string
    status: Status
    lastUpdated: number
    runCache: RunCache
    elem: WeyaElement
    lastRecordedContainer: WeyaElement
    lastUpdatedContainer: WeyaElement
    statusViewContainer: WeyaElement
    autoRefresh: Timeout
    loader: Loader
    statusCache: RunStatusCache

    constructor(opt: RunHeaderOptions) {
        this.uuid = opt.uuid
        this.lastUpdated = opt.lastUpdated
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.lastUpdated = opt.lastUpdated ? opt.lastUpdated : this.statusCache.lastUpdated

        this.loader = new Loader()
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}})

        this.elem.appendChild(this.loader.render($))
        this.status = await this.statusCache.get()
        this.run = await this.runCache.get()
        this.loader.remove()

        if (this.status.isRunning) {
            this.autoRefresh = setInterval(this.setCounter.bind(this), 1000)
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
        this.status = await this.statusCache.get()

        this.lastUpdated = lastUpdated ? lastUpdated : this.statusCache.lastUpdated

        this.renderStatusView()
        this.renderLastRecorded()
        this.renderLastUpdated()

        if (!this.status.isRunning) {
            this.clearCounter()
        }
    }

    onClick = () => {
        setTimeout(() => {
            ROUTER.navigate(`/header/${this.uuid}`)
        }, isMobile ? 100 : 0)
    }
}
