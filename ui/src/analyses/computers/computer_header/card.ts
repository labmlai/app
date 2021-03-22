import {Weya, WeyaElementFunction} from '../../../../../lib/weya/weya'
import CACHE, {ComputerCache, ComputerStatusCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import {Status} from "../../../models/status"
import {StatusView} from "../../../components/status"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Computer} from '../../../models/computer'
import {DataLoader} from '../../../components/loader'
import {ROUTER} from "../../../app"

interface ComputerHeaderOptions extends CardOptions {
    lastUpdated?: number
    clickable?: boolean
}

export class ComputerHeaderCard {
    computer: Computer
    uuid: string
    status: Status
    lastUpdated: number
    computerCache: ComputerCache
    elem: HTMLDivElement
    lastRecordedContainer: HTMLDivElement
    statusViewContainer: HTMLDivElement
    statusCache: ComputerStatusCache
    private loader: DataLoader
    private clickable: boolean

    constructor(opt: ComputerHeaderOptions) {
        this.uuid = opt.uuid
        this.lastUpdated = opt.lastUpdated
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.computer = await this.computerCache.get(force)

            this.lastUpdated = opt.lastUpdated ? opt.lastUpdated : this.statusCache.lastUpdated
        })
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            this.loader.render($)
        })

        if (this.clickable) {
            this.elem.classList.remove('disabled')
            this.elem.classList.add('labml-card-action')
            this.elem.addEventListener('click', this.onClick)
        }

        try {
            await this.loader.load()

            Weya(this.elem, $ => {
                $('div', $ => {
                    this.lastRecordedContainer = $('div')
                    $('div', '.run-info', $ => {
                        this.statusViewContainer = $('div')
                        $('h3', `${this.computer.name}`)
                        $('h5', `${this.computer.comment}`)
                    })
                })
            })

            this.renderStatusView()
            this.renderLastRecorded()
        } catch (e) {

        }

    }

    renderLastRecorded() {
        let lastRecorded = this.status.last_updated_time

        this.lastRecordedContainer.innerHTML = ''
        Weya(this.lastRecordedContainer, $ => {
            $('div', '.last-updated.mb-2', `Last Recorded ${this.status.isRunning ?
                    getTimeDiff(lastRecorded * 1000) : formatTime(lastRecorded)}`)
        })
    }

    renderStatusView() {
        this.statusViewContainer.innerHTML = ''
        Weya(this.statusViewContainer, $ => {
            new StatusView({status: this.status.run_status, type: 'computer'}).render($)
        })
    }

    async refresh(lastUpdated?: number) {
        try {
            await this.loader.load(true)

            this.lastUpdated = lastUpdated ? lastUpdated : this.statusCache.lastUpdated

            this.renderStatusView()
            this.renderLastRecorded()
        } catch (e) {

        }
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/header`)
    }
}
