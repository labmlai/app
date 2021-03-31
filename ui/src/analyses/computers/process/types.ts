import {SeriesModel} from "../../../models/run"

export interface ProcessModel {
    process_id: string
    name: string
    cpu: SeriesModel
    rss: SeriesModel
    dead: number
}

export interface ProcessDetailsModel extends ProcessModel {
    create_time: number,
    cmdline: string,
    exe: string
    pid: number
    ppid: number
    vms: SeriesModel
    threads: SeriesModel
    user: SeriesModel
    system: SeriesModel
}