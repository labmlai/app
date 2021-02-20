import {RunHeaderCard} from "./card"
import {RunHeaderHandler} from "./view"
import {Analysis} from "../../types"


let runHeaderAnalysis: Analysis = {
    card: RunHeaderCard,
    viewHandler: RunHeaderHandler,
    route: 'header'
}

export default runHeaderAnalysis