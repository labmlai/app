import {WeyaElement} from '../../lib/weya/weya'
import {getWindowDimensions} from "./utils/window_dimentions";

abstract class ScreenView {
    abstract render(): WeyaElement

    onResize(width: number) {
    }

    destroy() {
    }
}

class ScreenContainer {
    view?: ScreenView

    constructor() {
        this.view = null
        window.addEventListener('resize', this.onResize)
    }

    onResize = () => {
        let windowWidth = getWindowDimensions().width
        if(this.view) {
            this.view.onResize(windowWidth)
        }
    }

    setView(view: ScreenView) {
        if(this.view) {
            this.view.destroy()
        }
        this.view = view
        document.body.innerHTML = ''
        this.onResize()
        document.body.append(this.view.render())
    }
}

export {ScreenContainer, ScreenView}
