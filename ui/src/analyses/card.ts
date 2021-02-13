import {WeyaElementFunction} from "../../../lib/weya/weya"

export default abstract class Card {
    protected constructor() {
    }

    abstract render($: WeyaElementFunction)

    protected abstract loadData()

    abstract refresh()
}