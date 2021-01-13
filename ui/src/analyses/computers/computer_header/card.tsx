/*TODO design a reusable component that can be used with RunHeader */

import React, {useEffect, useState} from "react"

import {CardProps} from "../../types"
import {Computer} from "../../../models/computer"
import {Status} from "../../../models/status"
import CACHE from "../../../cache/cache"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {LabLoader} from "../../../components/utils/loader"
import {StatusView} from "../../../utils/status"

import "../../experiments/run_header/style.scss"

interface ComputerViewProps {
    computer: Computer
    status: Status
    lastUpdated: string | null
    isClicked: boolean
}

function ComputerView(props: ComputerViewProps) {
    let computerView = null

    if (props.computer != null && props.status != null && (!props.status.isRunning || props.lastUpdated != null)) {
        let lastRecorded = props.status.last_updated_time

        computerView = <div>
            <div className={'last-updated mb-2'}>
                Last Recorded {props.status.isRunning ? getTimeDiff(lastRecorded * 1000) : formatTime(lastRecorded)}
            </div>
            <div className={'run-info'}>
                <StatusView status={props.status.run_status}/>
                <h3>{props.computer.name}</h3>
                <h5>{props.computer.comment}</h5>
                {props.isClicked &&
                <div>
                    <div className={"run-uuid"}>
                        <span role={'img'} aria-label={'running'}>📌 Session UUID:</span>{props.computer.session_uuid}
                    </div>
                    <div className={'start-time'}>Started {formatTime(props.computer.start_time)}</div>
                </div>
                }
            </div>
            {
                props.status.isRunning &&
                <div className={'last-updated text-info'}>{props.lastUpdated}</div>
            }
        </div>
    } else {
        return <LabLoader/>
    }

    let className = 'labml-card labml-card-action'
    if (props.isClicked) {
        className += ' selected'
    }

    return <div className={className}>
        {computerView}
    </div>
}

interface RunHeaderProps extends CardProps {
    lastUpdated?: number
}

function ComputerHeaderCard(props: RunHeaderProps) {
    const [computer, setComputer] = useState(null as unknown as Computer)
    const [isClicked, setIsClicked] = useState(false)
    const [status, setStatus] = useState(null as unknown as Status)
    const [lastUpdated, setLastUpdated] = useState(null as (string | null))

    const computerCache = CACHE.getComputer(props.uuid)
    const statusCache = CACHE.getComputerStatus(props.uuid)

    useEffect(() => {
        async function load() {
            let status = await statusCache.get()
            setStatus(status)
            let computer = await computerCache.get()
            document.title = `LabML: ${computer.name.trim()}`
            setComputer(computer)
            let lastUpdated = props.lastUpdated ? props.lastUpdated : statusCache.lastUpdated
            if (status && status.isRunning && lastUpdated > 0) {
                setLastUpdated(getTimeDiff(lastUpdated))
            }
        }

        load().then()
    }, [props.lastUpdated, computerCache, statusCache])

    useEffect(() => {
        async function loadStatus() {
            let status = await statusCache.get()
            setStatus(status)
            let lastUpdated = props.lastUpdated ? props.lastUpdated : statusCache.lastUpdated
            setLastUpdated(getTimeDiff(lastUpdated))
            if (!status.isRunning) {
                clearInterval(interval)
            }
        }

        let interval = setInterval(loadStatus, 1000)
        return () => clearInterval(interval)
    }, [props.lastUpdated, statusCache])


    function onClick() {
        setIsClicked(!isClicked)
    }

    return <div onClick={onClick}>
        <ComputerView computer={computer} status={status} lastUpdated={lastUpdated} isClicked={isClicked}/>
    </div>
}

export default ComputerHeaderCard