import React, {forwardRef, useEffect, useState} from "react"
import {Analysis, SummaryCardProps, ViewCardProps} from "../../../types"
import {Run} from "../../../../models/run"
import CACHE from "../../../../cache/cache"


function StdOut(props: SummaryCardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(props.uuid)

    const Filter = require('../ansi_to_html.js')
    const f = new Filter({})

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        load().then()
    })

    return <div className={'labml-card labml-card-action'}>
        {run && run.stdout.map((element, i) => {
            return <div key={i} dangerouslySetInnerHTML={{__html: f.toHtml(element)}}/>
        })}
    </div>
}

function StdOutView(props: ViewCardProps) {
    const params = new URLSearchParams(props.location.search)
    const runUUID = params.get('uuid') as string

    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.getRun(runUUID)

    const Filter = require('../ansi_to_html.js')
    const f = new Filter({})

    useEffect(() => {
        async function load() {
            setRun(await runCache.get())
        }

        load().then()
    })

    return <div className={'labml-card labml-card-action'}>
        {run && run.stdout.map((element, i) => {
            return <div key={i} dangerouslySetInnerHTML={{__html: f.toHtml(element)}}/>
        })}
    </div>
}

let StdOutCard = forwardRef(StdOut)

let stdOutAnalysis: Analysis = {
    card: StdOutCard,
    view: StdOutView,
    route: `${URL}`
}

export default stdOutAnalysis
