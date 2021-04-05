import {WeyaElementFunction, Weya as $,} from '../../../lib/weya/weya'

interface AlertMessageOptions {
    message: string,
    onClickMessage?: () => void
}

export class AlertMessage {
    message: string
    elem: HTMLDivElement
    onClickMessage: () => void

    constructor(opt: AlertMessageOptions) {
        this.message = opt.message
        this.onClickMessage = opt.onClickMessage
    }

    render($: WeyaElementFunction) {
        this.elem = $('div', '.message.alert.pointer-cursor.mt-1',
            {on: {click: this.onClickMessage}},
            $ => {
                $('span', this.message)
                $('span', '.close-btn',
                    String.fromCharCode(215),
                    {on: {click: this.hideMessage.bind(this, true)}}
                )
            })
    }

    hideMessage(isHidden: boolean) {
        if (isHidden) {
            this.elem.classList.add('hide')
        } else {
            this.elem.classList.remove('hide')
        }
    }
}

export class UserMessages {
    message: string
    elem: HTMLDivElement

    constructor() {
    }

    render($: WeyaElementFunction) {
        this.elem = $('div', '.pointer-cursor.mt-1')
    }

    hideMessage(isHidden: boolean) {
        if (isHidden) {
            this.elem.classList.add('hide')
        } else {
            this.elem.classList.remove('hide')
        }
    }

    NetworkErrorMessage() {
        this.message = 'An unexpected network error occurred. Please try again later'
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.message.alert', $ => {
                $('span', this.message)
                $('span', '.close-btn',
                    String.fromCharCode(215),
                    {on: {click: this.hideMessage.bind(this, true)}}
                )
            })
        })
        this.hideMessage(false)
    }

    successMessage(message: string) {
        this.message = message
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.message.success', $ => {
                $('span', this.message)
                $('span', '.close-btn',
                    String.fromCharCode(215),
                    {on: {click: this.hideMessage.bind(this, true)}}
                )
            })
        })
        this.hideMessage(false)
    }
}
