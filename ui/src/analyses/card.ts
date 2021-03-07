import {WeyaElementFunction} from "../../../lib/weya/weya"
import {CardOptions} from "./types"

export default abstract class Card {
    protected constructor(opt: CardOptions) {
    }

    abstract render($: WeyaElementFunction)

    abstract refresh()

    abstract getLastUpdated(): number
}
