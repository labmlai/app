import {Weya as $, WeyaElement, WeyaElementFunction} from "../../../lib/weya/weya"
import {ROUTER} from '../app'
import {experimentAnalyses} from '../analyses/analyses'
import runHeaderAnalysis from '../analyses/experiments/run_header/init'


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

interface BackButtonOptions extends buttonOptions {
    text: string
}

export class BackButton extends Button {
    currentPath: string
    navigatePath: string
    text: string = 'Home'

    constructor(opt: BackButtonOptions) {
        super(opt)

        this.text = opt.text
        this.currentPath = window.location.pathname

        if (this.currentPath.includes('run')) {
            this.text = 'Runs'
            this.navigatePath = 'runs'
        } else if (this.currentPath.includes(runHeaderAnalysis.route)) {
            this.text = 'Run'
            this.navigatePath = this.currentPath.replace(runHeaderAnalysis.route, 'run')
        } else {
            for (let analysis of experimentAnalyses) {
                if (this.currentPath.includes(analysis.route)) {
                    this.text = 'Run'
                    this.navigatePath = this.currentPath.replace(analysis.route, 'run')
                    break
                }
            }
        }
    }

    onClick = () => {
        ROUTER.navigate(this.navigatePath)
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab.float-left',
            {on: {click: this.onClick}},
            $ => {
                $('span.fas.fa-chevron-left', '')
                $('span.ms-1', 'Run')
            })
    }
}

export class RefreshButton extends Button {
    elem: WeyaElement

    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        this.elem = $('nav.nav-link.tab.float-right',
            {on: {click: this.onClick}},
            $ => {
                $('span.fas.fa-sync', '')
            })
    }

    remove() {
        this.elem.remove()
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

export class MenuButton extends Button {
    constructor(opt: buttonOptions) {
        super(opt)
    }

    render($: WeyaElementFunction) {
        $('nav.burger.nav-link.tab.float-left',
            {on: {click: this.onClick}},
            $ => {
                $('span.fas.fa-bars', '')
            })
    }
}

interface NavButtonOptions extends buttonOptions {
    text: string
    icon: string
}

export class NavButton extends Button {
    text: string
    icon: string

    constructor(opt: NavButtonOptions) {
        super(opt)
        this.icon = opt.icon
        this.text = opt.text
    }

    render($: WeyaElementFunction) {
        $('nav.nav-link.tab',
            {on: {click: this.onClick}},
            $ => {
                $('span', this.icon, '')
                $('span', '', this.text)
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
        this.toggleButton = $(`div.d-flex`,
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
