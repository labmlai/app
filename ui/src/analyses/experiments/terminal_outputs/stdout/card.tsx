import React, {useEffect, useState} from "react"
import {CardProps} from "../../../types"
import {Run} from "../../../../models/run"
import CACHE from "../../../../cache/cache"


function StdOutCard(props: CardProps) {
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


export default StdOutCard