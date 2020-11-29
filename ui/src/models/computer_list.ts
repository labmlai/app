import {RunStatus} from "./status"

export interface ComputerListItemModel {
    computer_uuid: string
    computer_status: RunStatus
    last_updated_time: number
    name: string
    comment: string
    start_time: number
}

export interface ComputersListModel {
    computers: ComputerListItemModel[]
    labml_token: string
}


export class ComputerListItem {
    computer_uuid: string
    computer_status: RunStatus
    last_updated_time: number
    name: string
    comment: string
    start_time: number

    constructor(computer_list_item: ComputerListItemModel) {
        this.computer_uuid = computer_list_item.computer_uuid
        this.name = computer_list_item.name
        this.comment = computer_list_item.comment
        this.start_time = computer_list_item.start_time
        this.last_updated_time = computer_list_item.last_updated_time
        this.computer_status = new RunStatus(computer_list_item.computer_status)
    }
}

export class ComputersList {
    computers: ComputerListItemModel[]
    labml_token: string

    constructor(computers_list: ComputersListModel) {
        this.computers = []
        for (let c of computers_list.computers) {
            this.computers.push(new ComputerListItem(c))
        }
        this.labml_token = computers_list.labml_token
    }
}
