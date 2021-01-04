import React from "react"

import {Footer} from '../utils/footer'

import "./empty_runs_list.scss"

export function EmptyComputersList() {
    return <div>
        <div className={'text-center'}>
            <h5 className={'mt-4 px-1'}>You will see your computers here</h5>
            <p className={'px-1'}>Start monitoring your computers with just one command:</p>
        </div>
        <div className={'mt-5'}>
            <Footer/>
        </div>
    </div>
}


