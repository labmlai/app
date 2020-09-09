import React, {useEffect, useState} from "react"
import Loader from 'react-loader-spinner'


import NETWORK from '../network'
import {RunsTable} from "../components/runs_table"
import {Markdown} from "../components/markdown"


interface RunsProps {
    location: any
}

function RunsView(props: RunsProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<any[]>([])

    const params = new URLSearchParams(props.location.search)
    const labMlToken = params.get('labml_token')


    useEffect(() => {
        if (labMlToken) {
            NETWORK.get_runs(labMlToken).then((res) => {
                if (res) {
                    setRuns(res.data)
                    setIsLoading(false)
                }
            })
        }
    }, [labMlToken])

    return <div>
        {(() => {
            if (isLoading) {
                return (
                    <div className={'loader'}>
                        <Loader
                            type="Bars"
                            color="#00BFFF"
                            height={100}
                            width={100}
                        />
                    </div>
                )
            } else if (runs.length === 0) {
                return (
                    <Markdown labMlToken={labMlToken}/>
                )
            } else {
                return (
                    <RunsTable runs={runs}/>
                )
            }
        })()}
    </div>
}

export default RunsView