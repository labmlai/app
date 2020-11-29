import React from "react"

import {List} from "./list"

interface RunsListProps {
    runs: any[]
    onDelete?: (itemsSet: Set<string>) => void
}

export function RunsList(props: RunsListProps) {
    return <List items={props.runs} onDelete={props.onDelete} itemKey={'run'}/>
}