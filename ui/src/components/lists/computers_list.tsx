import React from "react"

import {List} from "./list"

interface ComputersListProps {
    computers: any[]
    onDelete: (itemsList: Set<string>) => void
    onRefresh: () => void
}

export function ComputersList(props: ComputersListProps) {
    return <List items={props.computers} onDelete={props.onDelete} itemKey={'computer'} onRefresh={props.onRefresh}/>
}