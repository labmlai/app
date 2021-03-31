import NETWORK from "../../../network"
import CACHE, {ComputerStatusCache, StatusCache} from "../../../cache/cache"
import {CacheObject, isReloadTimeout} from "../../../cache/cache"
import {ProcessDetailsModel} from "./types"


export class DetailsDataCache extends CacheObject<ProcessDetailsModel> {
    private readonly uuid: string
    private readonly processId: string
    private statusCache: StatusCache

    constructor(uuid: string, processId: string, statusCache: StatusCache) {
        super()
        this.uuid = uuid
        this.processId = processId
        this.statusCache = statusCache
    }

    async load(): Promise<ProcessDetailsModel> {
        return this.broadcastPromise.create(async () => {
            return await NETWORK.getCustomAnalysis(`process/${this.uuid}/details/${this.processId}`)
        })
    }

    async get(isRefresh = false): Promise<ProcessDetailsModel> {
        let status = await this.statusCache.get()

        if (this.data == null || (status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
            this.data = await this.load()
            this.lastUpdated = (new Date()).getTime()

            if ((status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
                await this.statusCache.get(true)
            }
        }

        return this.data
    }
}

export class DetailsCache<TA extends DetailsDataCache> {
    private readonly series: new (uuid: string, processId: string, status: ComputerStatusCache) => TA
    private readonly seriesCaches: { [uuid: string]: DetailsDataCache }

    constructor(series: new (uuid: string, processId: string, status: ComputerStatusCache) => TA) {
        this.seriesCaches = {}
        this.series = series
    }

    getAnalysis(uuid: string, processId: string) {
        if (this.seriesCaches[uuid] == null) {
            this.seriesCaches[uuid] = new this.series(uuid, processId, CACHE.getComputerStatus(uuid))
        }

        return this.seriesCaches[uuid]
    }
}