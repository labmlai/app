import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import CACHE, {IsUserLoggedCache} from "../cache/cache"
import NETWORK from '../network'

class LoginView extends ScreenView {
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    elem: WeyaElement
    loader: Loader

    token: string
    returnUrl: string

    constructor(token?: string, returnUrl: string = '/runs') {
        super()

        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.loader = new Loader()

        this.token = token
        this.returnUrl = returnUrl
    }

    get requiresAuth(): boolean {
        return false;
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

        if (this.token) {
            let res = await NETWORK.signIn(this.token)
            if (res.is_successful) {
                this.isUserLoggedCache.userLogged = true
                SCREEN.updateTheme().then()
                ROUTER.navigate(this.returnUrl)
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
        let returnUrl = sessionStorage.getItem('return_url') || '/runs'

        for (let i = 0; i < params.length; i++) {
            let val = params[i].split('=')
            switch (val[0]) {
                case 'access_token':
                    token = val[1]
                    break
                case 'return_url':
                    returnUrl = val[1]
                    break
            }
        }
        sessionStorage.setItem('return_url', returnUrl)
        SCREEN.setView(new LoginView(token, returnUrl))
    }
}
