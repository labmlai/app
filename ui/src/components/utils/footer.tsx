import React from "react"

import "./footer.scss"

export function Footer() {
    return <div className={'footer-copyright text-center'}>
        <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
        <span> | </span>
        <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
    </div>
}