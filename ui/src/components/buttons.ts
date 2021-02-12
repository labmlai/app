import {WeyaElementFunction} from "../../../lib/weya/weya"

interface buttonOptions {
    onButtonClick?: () => void
    isDisabled?: boolean
}

abstract class Button {
    onButtonClick: () => void
    isDisabled: boolean

    protected constructor(opt: buttonOptions) {
        this.onButtonClick = opt.onButtonClick
        this.isDisabled = opt.isDisabled
    }

    render($: WeyaElementFunction) {
    }

}

export class BackButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-left',
            {on: {click: this.onButtonClick}},
            $ => {
                $('span.fas.fa-chevron-left', '')
                $('span.ml-1', 'Run')
            })
    }
}

export class RefreshButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-right',
            {on: {click: this.onButtonClick}},
            $ => {
                $('span.fas.fa-sync', '')
            })
    }
}

export class SaveButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-right',
            {on: {click: this.onButtonClick}},
            $ => {
                $('span.fas.fa-save', '')
            })
    }
}

export class EditButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-right',
            {on: {click: this.onButtonClick}},
            $ => {
                $('span.fas.fa-edit', '')
            })
    }
}

export class DeleteButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-right',
            {on: {click: this.onButtonClick}},
            $ => {
                $('span.fas.fa-trash', '')
            })
    }
}

export class CancelButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-right',
            {on: {click: this.onButtonClick}},
            $ => {
                $('span.fas.fa-times', '')
            })
    }
}