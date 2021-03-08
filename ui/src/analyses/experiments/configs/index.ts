import {ConfigsCard} from "./card"
import {ConfigsHandler} from "./view"
import {Analysis} from "../../types"

let configsAnalysis: Analysis = {
    card: ConfigsCard,
    viewHandler: ConfigsHandler,
    route: 'configs'
}

export default configsAnalysis
