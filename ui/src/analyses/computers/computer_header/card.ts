import {Weya, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import CACHE, {ComputerCache, ComputerStatusCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import {Status} from "../../../models/status"
import {StatusView} from "../../../components/status"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Computer} from '../../../models/computer'
import {Loader} from '../../../components/loader'
import Timeout = NodeJS.Timeout
import {ROUTER} from "../../../app"


interface ComputerHeaderOptions extends CardOptions {
    lastUpdated?: number
}

export class ComputerHeaderCard {
    computer: Computer
    uuid: string
    status: Status
    lastUpdated: number
    computerCache: ComputerCache
    elem: WeyaElement
    lastRecordedContainer: WeyaElement
    lastUpdatedContainer: WeyaElement
    statusViewContainer: WeyaElement
    autoRefresh: Timeout
    loader: Loader
    statusCache: ComputerStatusCache
    isToggled: boolean

    constructor(opt: ComputerHeaderOptions) {
        this.uuid = opt.uuid
        this.lastUpdated = opt.lastUpdated
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.lastUpdated = opt.lastUpdated ? opt.lastUpdated : this.statusCache.lastUpdated
        this.isToggled = false

        this.loader = new Loader()
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}})

        this.elem.appendChild(this.loader.render($))
        try {
            this.status = await this.statusCache.get()
            this.computer = await this.computerCache.get()
        } catch (e) {
            // Let the parent view handle network failures
        }
        this.loader.remove()

        if (this.status.isRunning) {
            this.autoRefresh = setInterval(this.setCounter.bind(this), 1000)
        }

        Weya(this.elem, $ => {
            $('div', $ => {
                this.lastRecordedContainer = $('div')
                $('div', '.run-info', $ => {
                    this.statusViewContainer = $('div')
                    $('h3', `${this.computer.name}`)
                    $('h5', `${this.computer.comment}`)
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
            $('div', '.last-updated.mb-2', `Last Recorded ${this.status.isRunning ?
                    getTimeDiff(lastRecorded * 1000) : formatTime(lastRecorded)}`)
        })
    }

    renderLastUpdated() {
        this.lastUpdatedContainer.innerHTML = ''
        Weya(this.lastUpdatedContainer, $ => {
            if (this.status.isRunning) {
                $('div', '.last-updated.text-info', `${getTimeDiff(this.lastUpdated)}`)
            }
        })
    }

    renderStatusView() {
        this.statusViewContainer.innerHTML = ''
        Weya(this.statusViewContainer, $ => {
            new StatusView({status: this.status.run_status, type: 'computer'}).render($)
        })
    }

    clearCounter() {
        if (this.autoRefresh) {
            clearInterval(this.autoRefresh)
        }
    }

    setCounter() {
        this.renderLastRecorded()
        this.renderLastUpdated()
    }

    async refresh(lastUpdated?: number) {
        try {
            this.status = await this.statusCache.get()
        } catch (e) {
            // Let the parent view handle network failures
        }

        this.lastUpdated = lastUpdated ? lastUpdated : this.statusCache.lastUpdated

        this.renderStatusView()
        this.renderLastRecorded()
        this.renderLastUpdated()

        if (!this.status.isRunning) {
            this.clearCounter()
        }
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/header`)
    }
}
