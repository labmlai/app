import React from "react";
import {Table} from "react-bootstrap";

import {getTimeDiff, StatusView, formatTime, Run} from "./utils"


interface RunsTableProps {
    runs: Run[]
}

export function RunsTable(props: RunsTableProps) {

    return <Table striped bordered hover responsive>
        <thead>
        <tr>
            <th>#</th>
            <th>Run UUID</th>
            <th>Name</th>
            <th>Comment</th>
            <th>Start Time</th>
            <th>Last Updated Time</th>
            <th>Status</th>
        </tr>
        </thead>
        <tbody>
        {props.runs.map((run, idx) => (
            <tr key={idx}>
                <td>
                    {idx + 1}
                </td>
                <td>
                    <a href={`/run?run_uuid=${run.run_uuid}`}>
                        {run.run_uuid}
                    </a>
                </td>
                <td>
                    {run.name}
                </td>
                <td>
                    {run.comment}
                </td>
                <td>
                    {formatTime(run.start)}
                </td>
                <td>
                    {getTimeDiff(run.time)}
                </td>
                <td>
                    <StatusView status={run.status}/>
                </td>
            </tr>
        ))}
        </tbody>
    </Table>
}