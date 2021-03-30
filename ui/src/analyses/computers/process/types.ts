import {SeriesModel} from "../../../models/run"

export interface ProcessModel {
    process_id: string
    name: string
    cpu: SeriesModel
    rss: SeriesModel
}


export interface ProcessDetailsModel extends ProcessModel {
    create_time: string,
    cmdline: string,
    exe: string
    pid: number
    ppid: number
    dead: number
    vms: SeriesModel
    threads: SeriesModel
    user: SeriesModel
    system: SeriesModel
}