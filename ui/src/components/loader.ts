import {WeyaElement, WeyaElementFunction} from '../../../lib/weya/weya'

export class Loader {
    elem: WeyaElement
    isScreenLoader: boolean

    constructor(isScreenLoader?: boolean) {
        this.isScreenLoader = isScreenLoader
        this.elem = null
    }

    render($: WeyaElementFunction) {
        if (this.isScreenLoader) {
            this.elem = $('div', '.loader-container', $ => {
                $('div', '.text-center.mt-5', $ => {
                    $('img', '.logo-style', {src: '/images/lab_logo.png'})
                })
                $('div', '.center', $ => {
                    $('div.loader', '')
                })
            })
        } else {
            this.elem = $('div', '.center', $ => {
                $('div', '.loader', '')
            })
        }

        return this.elem
    }

    remove() {
        if (this.elem == null) {
            return
        }
        this.elem.remove()
        this.elem = null
    }
}

