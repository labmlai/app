import {Weya, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import CACHE, {ComputerCache, ComputerStatusCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import {Status} from "../../../models/status"
import {StatusView} from "../../../components/status"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Computer} from '../../../models/computer';
import {Loader} from '../../../components/loader';
import Timeout = NodeJS.Timeout;


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
    hiddenContainer: HTMLDivElement
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
        this.status = await this.statusCache.get()
        this.computer = await this.computerCache.get()
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
                    this.hiddenContainer = $('div', '.hide', $ => {
                        $('div', '.run-uuid', $ => {
                            $('span', '.heading', '📌 Session UUID:', {role: 'img', 'aria-label': 'running'})
                            $('span', '', this.computer.session_uuid)
                        })
                        $('div', '.start-time', `Started ${formatTime(this.computer.start_time)}`)
                    })
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
        this.isToggled = !this.isToggled
        if (this.isToggled) {
            this.elem.classList.add('selected')
            this.hiddenContainer.classList.remove('hide')
        } else {
            this.elem.classList.remove('selected')
            this.hiddenContainer.classList.add('hide')
        }
    }
}
