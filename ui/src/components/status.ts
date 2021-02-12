import {WeyaElementFunction} from '../../../lib/weya/weya'
import {RunStatusModel} from "../../../ui_old/src/models/status"

export interface StatusOptions {
    status: RunStatusModel
}

export class StatusView {
    status: RunStatusModel

    constructor(opt: StatusOptions) {
        this.status = opt.status
    }

    render($: WeyaElementFunction) {
        if (this.status.status === 'in progress') {
            $('div.status.text-info.text-uppercase', 'experiment is running')
        } else if (this.status.status === 'no response') {
            $('div.status.text-warning.text-uppercase', 'no response')
        } else if (this.status.status === 'completed') {
            $('div.status.text-success.text-uppercase', 'completed')
        } else if (this.status.status === 'crashed') {
            $('div.status.text-danger.text-uppercase', 'crashed')
        } else if (this.status.status === 'unknown') {
            $('div.status.text-info.text-uppercase', 'unknown status')
        } else {
            $('div.status', this.status.status)
        }
    }
}

