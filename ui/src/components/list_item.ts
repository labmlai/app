import {WeyaElementFunction} from '../../../lib/weya/weya'
import {RunListItemModel} from '../models/run_list'
import {StatusView} from './status'
import {formatTime} from '../utils/time'

export interface ListItemOptions {
    item: RunListItemModel
    onClick: (elem: ListItemView) => void
}

export class ListItemView {
    item: RunListItemModel
    elem: HTMLDivElement
    onClick: () => void

    constructor(opt: ListItemOptions) {
        this.item = opt.item
        this.onClick = () => {
            opt.onClick(this)
        }
    }


    render($: WeyaElementFunction) {
        this.elem = <HTMLDivElement>$('div.list-item',
            {on: {click: this.onClick}},
            $ => {
                new StatusView({status: this.item.run_status}).render($)
                $('p', `Started on ${formatTime(this.item.start_time)}`)
                $('h5', this.item.name)
                $('h6', this.item.comment)
            })
    }
}
