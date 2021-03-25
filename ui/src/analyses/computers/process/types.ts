import {SeriesModel} from "../../../models/run"

export interface ProcessModel {
    name: string
    cpu: SeriesModel
    mem: SeriesModel
}