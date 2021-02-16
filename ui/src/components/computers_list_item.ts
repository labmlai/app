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
    elem: HTMLDivElement
    onClick: () => void

    constructor(opt: ComputerListItemOptions) {
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
