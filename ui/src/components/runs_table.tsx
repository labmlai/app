import React from "react"
import {useHistory} from "react-router-dom";
import "./runs_table.scss"

import {getTimeDiff, StatusView, formatTime, Run} from "./utils"


interface RunsTableProps {
    runs: Run[]
}

export function RunsTable(props: RunsTableProps) {
    const history = useHistory();

    return <div className={"table"}>
        <div className={"table-header"}>
            <span>#</span>
            <span>Run UUID</span>
            <span>Name</span>
            <span>Comment</span>
            <span>Start Time</span>
            <span>Last Updated Time</span>
            <span>Status</span>
        </div>
        {props.runs.map((run, idx) => (
            <div key={idx}>
                <span>
                    {idx + 1}
                </span>
                <span>
                    <button
                        onClick={() => {
                            history.push(`/run?run_uuid=${run.run_uuid}`);
                        }}
                    >
                    {run.run_uuid}
                  </button>
                </span>
                <span>
                    {run.name}
                </span>
                <span>
                    {run.comment}
                </span>
                <span>
                    {formatTime(run.start)}
                </span>
                <span>
                    {getTimeDiff(run.time)}
                </span>
                <span>
                    <StatusView status={run.status}/>
                </span>
            </div>
        ))}
    </div>
}