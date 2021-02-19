import {Weya as $, WeyaElement} from '../../lib/weya/weya'
import {getWindowDimensions} from "./utils/window_dimentions";
import CACHE, {IsUserLoggedCache, UserCache} from './cache/cache';
import {Loader} from './components/loader';
import {ROUTER} from './app';

abstract class ScreenView {
    abstract render(): WeyaElement

    onResize(width: number) {
    }

    destroy() {
    }

    onRefresh() {
    }

    get requiresAuth() {
        return true
    }
}

class ScreenContainer {
    view?: ScreenView
    private isUserLoggedCache: IsUserLoggedCache
    private isUserLogged: boolean
    private userCache: UserCache
    private loader: Loader

    constructor() {
        this.view = null
        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.userCache = CACHE.getUser()
        this.isUserLoggedCache.get().then(val => {
            this.isUserLogged = val.is_user_logged
            this.updateTheme().then()
        })
        this.loader = new Loader()
        window.addEventListener('resize', this.onResize)
    }

    onResize = () => {
        let windowWidth = getWindowDimensions().width
        if (this.view) {
            this.view.onResize(windowWidth)
        }
    }

    async updateTheme() {
        let theme = 'light'
        if (this.isUserLogged) {
            theme = (await this.userCache.get()).theme
        }
        document.body.className = theme || 'light'
    }

    setView(view: ScreenView) {
        if (this.view) {
            this.view.destroy()
        }
        this.view = view
        document.body.innerHTML = ''
        this.loader.render($)
        this.isUserLoggedCache.get().then(value => {
            this.isUserLogged = value.is_user_logged
            if (this.view.requiresAuth && !value.is_user_logged) {
                ROUTER.navigate(`/login#return_url=${window.location.pathname}`)
                return
            }
            document.body.innerHTML = ''
            this.onResize()
            document.body.append(this.view.render())
        })
    }
}

export {ScreenContainer, ScreenView}
