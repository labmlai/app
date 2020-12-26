export interface InsightModel {
    message: string
    type: string
    time: number
}

export class Insight {
    message: string
    type: string
    time: number

    constructor(insight: InsightModel) {
        this.message = insight.message
        this.type = insight.type
        this.time = insight.time
    }
}

export class InsightsList {
    insights: Insight[]

    constructor(insights: InsightModel[]) {
        this.insights = []
        for (let i of insights) {
            this.insights.push(new Insight(i))
        }
    }
}