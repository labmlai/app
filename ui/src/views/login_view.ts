import {IsUserLogged, UserModel} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import CACHE, {IsUserLoggedCache} from "../cache/cache"
import NETWORK from '../network';

class LoginView extends ScreenView {
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    elem: WeyaElement
    loader: Loader

    token: string

    constructor(token?: string) {
        super()

        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.loader = new Loader()

        this.token = token
    }


    render() {
        this.elem = $('div', $ => {
            this.loader.render($)
        })

        this.handleLogin().then()

        return this.elem
    }

    private async handleLogin() {
        this.isUserLogged = await this.isUserLoggedCache.get()

        if(this.token) {
            let res = await NETWORK.signIn(this.token)
            if(res.is_successful) {
                this.isUserLoggedCache.userLogged = true
            }
        }

        if (!this.isUserLogged.is_user_logged) {
            NETWORK.redirectLogin()
            return
        }


        this.loader.remove()
    }

}

export class LoginHandler {
    constructor() {
        ROUTER.route('login', [this.handleLogin])
    }

    handleLogin = () => {
        let params = (window.location.hash.substr(1)).split("&")
        let token = undefined

        for (let i = 0; i < params.length; i++) {
            let val = params[i].split('=')
            if (val[0] == 'access_token') {
                token = val[1]
                break
            }
        }
        SCREEN.setView(new LoginView(token))
    }
}
