import {WeyaElementFunction} from '../../../lib/weya/weya'

interface AlertMessageOptions {
    message: string,
    onClickMessage: () => void
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
        this.elem = $('div', '.alert.pointer-cursor.mt-1',
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

