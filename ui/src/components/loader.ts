import {WeyaElement, WeyaElementFunction} from '../../../lib/weya/weya'

export class Loader {
    elem: WeyaElement
    isScreenLoader: boolean

    constructor(isScreenLoader?: boolean) {
        this.isScreenLoader = isScreenLoader
    }

    render($: WeyaElementFunction) {
        if (this.isScreenLoader) {
            this.elem = $('div', '.loader-container', $ => {
                $(`div.text-center.mt-5`, $ => {
                    $('img.image-style', {src: '../../images/lab_logo.png'})
                    $('h1.mt-3', 'LabML')
                })
                $(`div.center`, $ => {
                    $('div.loader', '')
                })
            })
        } else {
            this.elem = $(`div.center`, $ => {
                $('div.loader', '')
            })
        }

        return this.elem
    }

    remove() {
        this.elem.remove()
    }
}

