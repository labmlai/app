import {Weya as $, WeyaElementFunction} from '../../../lib/weya/weya'
import {MenuButton, NavButton} from './buttons';
import {Loader} from './loader';
import CACHE, {UserCache} from "../cache/cache"
import {User} from '../models/user';
import {ROUTER} from '../app';

const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'

export interface HamburgerMenuOptions {

}

export class HamburgerMenuView {
    elem: HTMLDivElement
    navLinksContainer: HTMLDivElement
    overlayElement: HTMLDivElement
    loader: Loader
    userCache: UserCache
    user: User
    isMenuVisible: boolean

    constructor(opt: HamburgerMenuOptions) {
        this.userCache = CACHE.getUser()

        this.loader = new Loader()
        this.isMenuVisible = false
    }


    render($: WeyaElementFunction) {
        this.elem = $('div', $ => {
            $('div', '.nav-container', $ => {
                this.navLinksContainer = $('div', '.nav-links', $ => {
                    this.loader.render($)
                })
                new MenuButton({onButtonClick: this.onMenuToggle}).render($)
                this.renderProfile().then()
            })
            this.overlayElement = $('div', '.overlay', {on: {click: this.onMenuToggle}})
        })


        return this.elem
    }

    private async renderProfile() {
        this.user = await this.userCache.get()

        this.loader.remove()

        $(this.navLinksContainer, $ => {
            $('div', '.text-center', $ => {
                $('img', '.mt-2.image-style.rounded-circle', {
                    src: this.user.picture || DEFAULT_IMAGE
                })
                $('div', '.mb-5.mt-3.mt-2', $ => {
                    $('h5', this.user.name)
                })
            })
            new NavButton({
                icon: '.fas.fa-running',
                text: 'Runs',
                onButtonClick: () => this.onNavigate('/runs')
            }).render($)
            new NavButton({
                icon: '.fas.fa-desktop',
                text: 'Computers',
                onButtonClick: () => this.onNavigate('/computers')
            }).render($)
            new NavButton({
                icon: '.fas.fa-book',
                text: 'Documentation',
                onButtonClick: () => this.onNewTab('https://docs.labml.ai')
            }).render($)
            new NavButton({
                icon: '.fas.fa-sliders-h',
                text: 'Settings',
                onButtonClick: () => this.onNavigate('/settings')
            }).render($)
            $('span', '.mt-5', '')
            new NavButton({icon: '.fas.fa-power-off', text: 'Log out', onButtonClick: this.onLogOut}).render($)
            new NavButton({
                icon: '.fas.fa-comments',
                text: 'Join our Slack',
                onButtonClick: () => this.onNewTab('https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/')
            }).render($)
        })
    }

    onMenuToggle = () => {
        this.isMenuVisible = !this.isMenuVisible
        if (this.isMenuVisible) {
            this.navLinksContainer.classList.add('nav-active')
            this.overlayElement.classList.add('d-block')
        } else {
            this.navLinksContainer.classList.remove('nav-active')
            this.overlayElement.classList.remove('d-block')
        }
    }

    onLogOut = () => {

    }

    onNavigate = (loc: string) => {
        ROUTER.navigate(loc)
    }

    onNewTab = (loc: string) => {
        window.open(loc)
    }

}
