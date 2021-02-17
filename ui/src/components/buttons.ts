import {WeyaElementFunction, WeyaElement, Weya as $} from "../../../lib/weya/weya"
import {ROUTER} from '../app'

interface buttonOptions {
    onButtonClick?: () => void
    isDisabled?: boolean
}

abstract class Button {
    onButtonClick: () => void
    isDisabled: boolean

    onClick = () => {
        this.onButtonClick()
    }

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

    onClick = () => {
        ROUTER.back()
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-left',
            {on: {click: this.onClick}},
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
            {on: {click: this.onClick}},
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
            {on: {click: this.onClick}},
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
            {on: {click: this.onClick}},
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
            {on: {click: this.onClick}},
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
            {on: {click: this.onClick}},
            $ => {
                $('span.fas.fa-times', '')
            })
    }
}

interface ToggleButtonOptions extends buttonOptions {
    text: string
    isToggled: boolean
}

export class ToggleButton extends Button {
    text: string
    isToggled: boolean
    defaultClass: string
    toggleButton: WeyaElement

    constructor(opt: ToggleButtonOptions) {
        super(opt)

        this.text = opt.text
        this.isToggled = opt.isToggled
        this.defaultClass = this.isToggled ? 'selected' : 'empty'
    }

    onClick = () => {
        this.onButtonClick()

        this.defaultClass = this.defaultClass === 'selected' ? 'empty' : 'selected'
        this.renderToggleButton()
    }

    render($: WeyaElementFunction) {
        this.toggleButton = $(`nav`,
            {on: {click: this.onClick}}
        )

        this.renderToggleButton()
    }

    renderToggleButton() {
        this.toggleButton.innerHTML = ''

        $(this.toggleButton, $ => {
            $(`nav.nav-link.float-left.tab.toggle-button.${this.defaultClass}`,
                $ => {
                    $('span', this.text)
                }
            )
        })
    }
}