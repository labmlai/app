import {WeyaElementFunction} from "../../../lib/weya/weya";

export default abstract class Card {
    protected constructor() {
    }

    render($: WeyaElementFunction) {
    }

    protected abstract async LoadData()

    abstract refresh()
}