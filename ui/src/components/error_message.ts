import {Weya} from '../../../lib/weya/weya'

export class ErrorMessage {
    elem: HTMLDivElement

    constructor() {
    }

    private _isVisible: boolean

    get isVisible() {
        return this._isVisible
    }

    render(parent: HTMLDivElement) {
        this._isVisible = true
        Weya(parent, $ => {
            this.elem = $('div', '.error.text-center.warning', $ => {
                $('span', '.fas.fa-exclamation-triangle', '')
                $('h4', '.text-uppercase', 'Failed to load data')
            })
        })
    }

    remove() {
        this._isVisible = false
        this.elem.remove()
    }
}

