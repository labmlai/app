import {WeyaElementFunction} from "../../../lib/weya/weya"
import {CardOptions} from './types';
import {ROUTER} from '../app';

export default abstract class Card {
    onClick: () => void

    protected constructor(opt: CardOptions) {
        this.onClick = () => {
            ROUTER.navigate(`/${opt.path}/${opt.uuid}`)
        }
    }

    abstract render($: WeyaElementFunction)

    abstract refresh()

    abstract getLastUpdated(): number
}
