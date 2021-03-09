import {Weya, WeyaElementFunction, WeyaElement} from '../../../lib/weya/weya'

class EmptyComputersList {
    constructor() {
    }

    render($: WeyaElementFunction) {
        $('div.text-center', $ => {
            $('h5.mt-4.px-1', 'You will see your computers here')
        })
    }

}