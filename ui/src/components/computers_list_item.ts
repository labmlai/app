import {WeyaElementFunction} from '../../../lib/weya/weya'
import {StatusView} from './status'
import {formatTime} from '../utils/time'
import {ComputerListItemModel} from '../models/computer_list';

export interface ComputerListItemOptions {
    item: ComputerListItemModel
    onClick: (elem: ComputersListItemView) => void
}

export class ComputersListItemView {
    item: ComputerListItemModel
    elem: HTMLAnchorElement
    onClick: (evt: Event) => void

    constructor(opt: ComputerListItemOptions) {
        this.item = opt.item
        this.onClick = (e: Event) => {
            e.preventDefault()
            opt.onClick(this)
        }
    }

    render($: WeyaElementFunction) {
        this.elem = $('a', '.list-item.list-group-item.list-group-item-action',
            {href: `/session/${this.item.session_uuid}`, on: {click: this.onClick}},
            $ => {
                $('div', $ => {
                    new StatusView({status: this.item.run_status, type: 'computer'}).render($)
                    $('p', `Started ${formatTime(this.item.start_time)}`)
                    $('h5', this.item.name)
                    $('h6', this.item.comment)
                })
            })
    }
}
