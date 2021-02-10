import {WeyaElement} from '../../lib/weya/weya'

interface ScreenView {
    render(): WeyaElement
}

class ScreenContainer {
    setView(view: ScreenView) {
        document.body.innerHTML = ''
        document.body.append(view.render())
    }
}

export {ScreenContainer, ScreenView}
