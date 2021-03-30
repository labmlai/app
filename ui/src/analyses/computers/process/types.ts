import {SeriesModel} from "../../../models/run"

export interface ProcessModel {
    process_id : string
    name: string
    cpu: SeriesModel
    rss: SeriesModel
}