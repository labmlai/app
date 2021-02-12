const REACT_APP_SERVER_URL = 'http://localhost:5000/api/v1'

class Network {
    baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    private sendHttpRequest = (method: string, url: string, data: object = {}) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open(method, this.baseURL + url)
            xhr.responseType = 'json'

            if (data) {
                xhr.setRequestHeader('Content-Type', 'application/json')
            }

            xhr.onload = () => {
                if (xhr.status >= 400) {
                    reject(xhr.response)
                } else {
                    resolve(xhr.response.data)
                }
            }

            xhr.onerror = () => {
                reject('Something went wrong!')
            }

            xhr.send(JSON.stringify(data))
        })
    }

    async getRun(run_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/run/${run_uuid}`)
    }

    async setRun(run_uuid: string, data: object): Promise<any> {
        return this.sendHttpRequest('POST', `/run/${run_uuid}`, data)
    }

    async getRunStatus(run_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/run/status/${run_uuid}`)
    }

    async getIsUserLogged(): Promise<any> {
        return this.sendHttpRequest('GET', `/auth/is_logged`)
    }
}

const NETWORK = new Network(REACT_APP_SERVER_URL)
export default NETWORK