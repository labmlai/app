import {WeyaElementFunction} from "../../../lib/weya/weya"
import isMobile from '../utils/mobile';
import {CardOptions} from './types';
import {ROUTER} from '../app';

export default abstract class Card {
    onClick: () => void

    protected constructor(opt: CardOptions) {
        this.onClick = () => {
            setTimeout(() => {
                ROUTER.navigate(`/${opt.path}/${opt.uuid}`)
            }, isMobile ? 100 : 0)
        }
    }

    abstract render($: WeyaElementFunction)

    abstract refresh()

    abstract getLastUpdated(): number
}
