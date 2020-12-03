import React from "react"

import {List} from "./list"

interface RunsListProps {
    runs: any[]
    onDelete?: (itemsSet: Set<string>) => void
    onRefresh?: () => void
}

export function RunsList(props: RunsListProps) {
    return <List items={props.runs} onDelete={props.onDelete} itemKey={'run'} onRefresh={props.onRefresh}/>
}