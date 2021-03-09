import {Weya, WeyaElementFunction, WeyaElement} from '../../../lib/weya/weya'
import PyTorchCode from '../components/codes/pytorch'
import KerasCode from '../components/codes/keras'

export class EmptyRunsList {
    currentTab: string
    codeContainer: WeyaElement

    constructor() {
        this.currentTab = 'pytoch'
    }

    clickHandle(tab: string) {
        this.currentTab = tab
        this.renderCode()
    }

    render($: WeyaElementFunction) {
        $('div.text-center', $ => {
            $('h5.mt-4.px-1', 'You will see your experiments here')
            $('p.px-1', 'Start monitoring your models by adding just two lines of code:')
        })

        $('div.text-center', $ => {
            $('nav.nav-link.d-inline.tab', 'PyTorch', {on: {click: () => this.clickHandle('pytoch')}})
            $('nav.nav-link.d-inline.tab', 'PyTorch Lightning', {on: {click: () => this.clickHandle('lightning')}})
            $('nav.nav-link.d-inline.tab', 'Keras', {on: {click: () => this.clickHandle('keras')}})
        })

        this.codeContainer = $('div')
        this.renderCode()
    }

    renderCode() {
        this.codeContainer.innerHTML = ''

        Weya(this.codeContainer, $ => {
            if (this.currentTab === 'pytoch') {
                new PyTorchCode().render($)
            } else if (this.currentTab === 'keras') {
                new KerasCode().render($)
            }
        })
    }
}