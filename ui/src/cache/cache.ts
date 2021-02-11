import {Run} from "../models/run"
import {Status} from "../models/status"
import NETWORK from "../network"

const RELOAD_TIMEOUT = 60 * 1000

function isReloadTimeout(lastUpdated: number): boolean {
    return (new Date()).getTime() - lastUpdated > RELOAD_TIMEOUT
}

class BroadcastPromise<T> {
    // Registers a bunch of promises and broadcast to all of them
    private isLoading: boolean
    private resolvers: any[]
    private rejectors: any[]

    constructor() {
        this.isLoading = false
        this.resolvers = []
        this.rejectors = []
    }

    private add(resolve: (value: T) => void, reject: (err: any) => void) {
        this.resolvers.push(resolve)
        this.rejectors.push(reject)
    }

    create(load: () => Promise<T>): Promise<T> {
        let promise = new Promise<T>((resolve, reject) => {
            this.add(resolve, reject)
        })

        if (!this.isLoading) {
            this.isLoading = true
            // Load again only if not currently loading;
            // Otherwise resolve/reject will be called when the current loading completes.
            load().then((res: T) => {
                this.resolve(res)
            }).catch((err) => {
                this.reject(err)
            })
        }

        return promise
    }

    private resolve(value: T) {
        this.isLoading = false
        let resolvers = this.resolvers
        this.resolvers = []
        this.rejectors = []

        for (let r of resolvers) {
            r(value)
        }
    }

    private reject(err: any) {
        this.isLoading = false
        let rejectors = this.rejectors
        this.resolvers = []
        this.rejectors = []

        for (let r of rejectors) {
            r(err)
        }
    }
}

abstract class CacheObject<T> {
    protected data!: T | any
    protected broadcastPromise = new BroadcastPromise<T>()
    private lastUsed: number
    public lastUpdated: number

    constructor() {
        this.lastUsed = 0
        this.lastUpdated = 0
    }

    abstract load(...args: any[]): Promise<T>

    async get(isRefresh = false, ...args: any[]): Promise<T> {
        if (this.data == null || isRefresh) {
            this.data = await this.load()
            this.lastUpdated = (new Date()).getTime()
        }

        this.lastUsed = new Date().getTime()

        return this.data
    }

    invalidate_cache(): void {
        this.data = null
    }
}

export class RunCache extends CacheObject<Run> {
    private readonly uuid: string
    private statusCache: RunStatusCache

    constructor(uuid: string, statusCache: RunStatusCache) {
        super()
        this.uuid = uuid
        this.statusCache = statusCache
    }

    async load(): Promise<Run> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getRun(this.uuid)
            return new Run(res)
        })
    }

    async get(isRefresh = false): Promise<Run> {
        let status = await this.statusCache.get()

        if (this.data == null || (status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
            this.data = await this.load()
            this.lastUpdated = (new Date()).getTime()
            await this.statusCache.get(true)
        }

        return this.data
    }

    async setRun(run: Run): Promise<void> {
        await NETWORK.setRun(this.uuid, run)
    }
}

export class RunStatusCache extends CacheObject<Status> {
    private readonly uuid: string

    constructor(uuid: string) {
        super()
        this.uuid = uuid
    }

    async load(): Promise<Status> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getRunStatus(this.uuid)
            return new Status(res)
        })
    }
}

class Cache {
    private readonly runs: { [uuid: string]: RunCache }
    private readonly runStatuses: { [uuid: string]: RunStatusCache }

    constructor() {
        this.runs = {}
        this.runStatuses = {}
    }

    getRun(uuid: string) {
        if (this.runs[uuid] == null) {
            this.runs[uuid] = new RunCache(uuid, this.getRunStatus(uuid))
        }

        return this.runs[uuid]
    }

    getRunStatus(uuid: string) {
        if (this.runStatuses[uuid] == null) {
            this.runStatuses[uuid] = new RunStatusCache(uuid)
        }

        return this.runStatuses[uuid]
    }
}

export default new Cache()
