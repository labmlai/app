import {WeyaElementFunction} from '../../../lib/weya/weya'

export class Loader {
    constructor() {

    }

    render($: WeyaElementFunction) {
        $(`div.center`, $ => {
            $('div.loader', '')
        })
    }
}

