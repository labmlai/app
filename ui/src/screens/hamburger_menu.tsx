import React, {useState} from "react"

import "./hamburger_menu.scss"


function HamburgerMenu() {
    const [navLinksClass, setNavLinksClass] = useState('')
    const [burgerClass, setBurgerClass] = useState('')

    function onBurgerClick() {
        // Toggle Nav
        if (navLinksClass) {
            setNavLinksClass('')
        } else {
            setNavLinksClass(' nav-active')
        }

        // Animate Links
        const navLinks = document.querySelectorAll<HTMLElement>('.nav-links li')
        navLinks.forEach((link, index: number) => {
            if (link.style.animation) {
                link.style.animation = ''
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`
            }
        })

        // Burger Animation
        if(burgerClass){
           setBurgerClass('')
        }else{
            setBurgerClass( ' toggle')
        }
    }

    return <div className={'nav-container'}>
        <nav>
            <div className={'logo'}>
                <h4>The Nav</h4>
            </div>
            <ul className={'nav-links' + navLinksClass}>
                <li>
                    <a href={'#'}>Home</a>
                </li>
                <li>
                    <a href={'#'}>About</a>
                </li>
                <li>
                    <a href={'#'}>Work</a>
                </li>
                <li>
                    <a href={'#'}>Projects</a>
                </li>
            </ul>
            <div className={'burger' + burgerClass} onClick={onBurgerClick}>
                <div className={'line1'}></div>
                <div className={'line2'}></div>
                <div className={'line3'}></div>
            </div>
        </nav>
    </div>
}

export default HamburgerMenu