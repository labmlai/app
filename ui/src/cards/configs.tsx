import {ConfigsView} from "../components/configs";
import React, {useEffect, useState} from "react";
import {Run} from "../models/run";
import CACHE from "../cache/cache"

interface CardProps {
    uuid: string
    width: number
}

function Card(props: CardProps) {
    let [run, setRun] = useState(null as unknown as Run)
    const runCache = CACHE.get(props.uuid)

    useEffect(() => {
        async function load() {
            try {
                setRun(await runCache.getRun())
            } catch (e) {
            }
        }

        load().then()
    })

    let configsView = null
    if (run != null) {
        configsView = <ConfigsView configs={run.configs} width={props.width}/>
    }

    return <div>{configsView}</div>
}

export default {
    Card: Card
}