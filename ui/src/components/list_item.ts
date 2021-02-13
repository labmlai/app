import {WeyaElementFunction} from '../../../lib/weya/weya';
import {RunListItemModel} from '../models/run_list';
import {StatusView} from './status';
import {formatTime} from '../utils/time';

export interface ListItemOptions {
  item: RunListItemModel
  onClick: (uuid: string) => void
}

export class ListItemView {
  item: RunListItemModel
  onClick: () => void

  constructor(opt: ListItemOptions) {
    this.item = opt.item
    this.onClick = () => {
      opt.onClick(this.item.run_uuid)
    }
  }

  render($: WeyaElementFunction) {
    $('div.list-item',
        {on: {click: this.onClick}},
            $ => {
      new StatusView({status: this.item.run_status}).render($)
      $('p', `Started on ${formatTime(this.item.start_time)}`)
      $('h5', this.item.name)
      $('h6', this.item.comment)
    })
  }
}
