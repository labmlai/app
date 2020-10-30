export function formatTime(time: number): string {
    let date = new Date(time * 1000)
    let timeStr = date.toTimeString().substr(0, 8)
    let dateStr = date.toDateString()
    return `on ${dateStr} at ${timeStr}`
}


export function getTimeDiff(timestamp: number): string {
    let timeDiff = (Date.now() / 1000 - timestamp / 1000) / 60

    if (timeDiff < 1) {
        return "less than a minute ago"
    } else if (timeDiff < 10) {
        return `${Math.round(timeDiff)} minutes ago`
    } else {
        return formatTime(timestamp)
    }
}

