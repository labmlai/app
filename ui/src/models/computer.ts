import {Config, ConfigModel} from "./config";

export interface ComputerModel {
    computer_uuid: string
    session_uuid: string
    name: string
    comment: string
    start_time: number
    is_claimed: boolean
    configs: ConfigModel[]
}

export class Computer {
    computer_uuid: string
    session_uuid: string
    name: string
    comment: string
    is_claimed: boolean
    start_time: number
    configs: Config[]

    constructor(computer: ComputerModel) {
        this.computer_uuid = computer.computer_uuid
        this.session_uuid = computer.session_uuid
        this.name = computer.name
        this.comment = computer.comment
        this.start_time = computer.start_time
        this.is_claimed = computer.is_claimed
        this.configs = []
        for (let c of computer.configs) {
            this.configs.push(new Config(c))
        }
    }
}


