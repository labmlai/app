import {WeyaElementFunction} from "../../../lib/weya/weya"

export default abstract class Card {
    protected constructor() {
    }

    abstract render($: WeyaElementFunction)

    abstract refresh()
}