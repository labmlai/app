import {WeyaElementFunction} from '../../../lib/weya/weya'

export class AlertMessage {
    message: string

    constructor(message: string) {
        this.message = message
    }

    render($: WeyaElementFunction) {
        $('div.alert',
            {on: {click: this.onClickMessage}},
            $ => {
                $('span', this.message)
                $('span.close-btn',
                    String.fromCharCode(215),
                    {on: {click: this.hideMessage}}
                )
            })
    }

    hideMessage() {
    }

    onClickMessage() {
    }
}

