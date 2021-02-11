import {WeyaElement} from '../../lib/weya/weya'

abstract class ScreenView {
    destroy() {

    }
    abstract render(): WeyaElement
}

class ScreenContainer {
    view?: ScreenView

    constructor() {
        this.view = null
    }

    setView(view: ScreenView) {
        if(this.view) {
            this.view.destroy()
        }
        this.view = view
        document.body.innerHTML = ''
        document.body.append(this.view.render())
    }
}

export {ScreenContainer, ScreenView}
