import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import {StatusView} from "../../../components/status"
import {getTimeDiff, formatTime} from "../../../utils/time"

interface RunHeaderOptions extends CardOptions {
    lastUpdated?: number
}

export class RunHeaderCard {
    run: Run
    uuid: string
    status: Status
    lastUpdated: number
    runCache: RunCache
    statusCache: RunStatusCache

    constructor(opt: RunHeaderOptions) {
        this.uuid = opt.uuid
        this.lastUpdated = opt.lastUpdated
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.lastUpdated = opt.lastUpdated ? opt.lastUpdated : this.statusCache.lastUpdated
    }


    render($: WeyaElementFunction) {
        this.LoadData().then(() => {
            $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
                $('div', $ => {
                    let lastRecorded = this.status.last_updated_time
                    $('div.last-updated.mb-2', `Last Recorded ${this.status.isStatusInProgress ?
                        getTimeDiff(lastRecorded * 1000) : formatTime(lastRecorded)}`)
                    $('div.run-info', $ => {
                        new StatusView({status: this.status.run_status}).render($)
                        $('h3', `${this.run.name}`)
                        $('h5', `${this.run.comment}`)
                        if (this.status.isStatusInProgress) {
                            $('div.last-updated.text-info', `${getTimeDiff(this.lastUpdated)}`)
                        }
                    })
                })
            })
        })
    }

    private async LoadData() {
        this.status = await this.statusCache.get()
        this.run = await this.runCache.get()
    }

    onClick = () => {
        ROUTER.navigate(`/run_header/${this.uuid}`)
    }
}
