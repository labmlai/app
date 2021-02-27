import mix_panel from "./mix_panel"
import {ROUTER} from './app'
import {APP_BASE_URL, AUTH0_CLIENT_ID, AUTH0_DOMAIN, API_BASE_URL} from './env'
import {Auth0User, User, UserModel} from './models/user'

class Network {
    baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    private sendHttpRequest = (method: string, url: string, data: object = {}) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.withCredentials = true
            xhr.open(method, this.baseURL + url)
            xhr.responseType = 'json'

            if (data) {
                xhr.setRequestHeader('Content-Type', 'application/json')
            }

            xhr.onload = () => {
                if (xhr.status >= 400) {
                    if (xhr.status === 403) {
                        // should not call here
                    } else if (xhr.status === 400) {
                        ROUTER.navigate(`/404`)
                    } else {
                        reject(xhr.response)
                    }
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

    private sendCustomHttpRequest = (method: string, url: string, data: object = {}, host: string = this.baseURL, headers: object = {}) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open(method, host + url)
            xhr.responseType = 'json'

            if (data) {
                xhr.setRequestHeader('Content-Type', 'application/json')
            }

            for (let key in headers) {
                if (!headers.hasOwnProperty(key)) continue;

                xhr.setRequestHeader(key, headers[key])
            }

            xhr.onload = () => {
                if (xhr.status >= 400) {
                    reject(xhr.response)
                } else {
                    resolve(xhr.response)
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

    async getComputer(computer_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/computer/${computer_uuid}`)
    }

    async getRunStatus(run_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/run/status/${run_uuid}`)
    }

    async getComputerStatus(computer_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/computer/status/${computer_uuid}`)
    }

    async getRuns(labml_token: string | null): Promise<any> {
        return this.sendHttpRequest('GET', `/runs/${labml_token}`)
    }

    async getComputers(): Promise<any> {
        return this.sendHttpRequest('GET', `/computers/${null}`)
    }

    async deleteRuns(runUUIDS: string[]): Promise<any> {
        return this.sendHttpRequest('PUT', `/runs`, {'run_uuids': runUUIDS})
    }

    async deleteSessions(computerUUIDS: string[]): Promise<any> {
        return this.sendHttpRequest('PUT', `/computers`, {'session_uuids': computerUUIDS})
    }

    async getUser(): Promise<any> {
        return this.sendHttpRequest('GET', `/user`, {})
    }

    async setUser(user: User): Promise<any> {
        return this.sendHttpRequest('POST', `/user`, {'user': user})
    }

    async signIn(token: string): Promise<any> {
        let res = await NETWORK.getAuth0Profile(token)
        let user = new Auth0User(res)

        mix_panel.people.set({
            $name: user.name,
            $email: user.email,
        })
        mix_panel.identify(user.email)

        let data = {} as UserModel
        data.name = user.name
        data.email = user.email
        data.sub = user.sub
        data.email_verified = user.email_verified
        data.picture = user.picture

        return this.sendHttpRequest('POST', `/auth/sign_in`, data)
    }

    async getAuth0Profile(token: string): Promise<any> {
        return this.sendCustomHttpRequest('GET', `/userinfo`, {}, AUTH0_DOMAIN, {
            'Authorization': `Bearer ${token}`
        })
    }

    async signOut(): Promise<any> {
        return this.sendHttpRequest('DELETE', `/auth/sign_out`)
    }

    redirectLogin() {
        window.location.href = `${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${APP_BASE_URL}/login&scope=openid%20profile%20email`
    }

    redirectLogout() {
        window.location.href = `${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${APP_BASE_URL}`
    }

    async getIsUserLogged(): Promise<any> {
        return this.sendHttpRequest('GET', `/auth/is_logged`)
    }

    async getAnalysis(url: string, run_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/${url}/${run_uuid}`, {})
    }

    async getPreferences(url: string, run_uuid: string): Promise<any> {
        return this.sendHttpRequest('GET', `/${url}/preferences/${run_uuid}`, {})
    }

    async updatePreferences(url: string, run_uuid: string, data: object): Promise<any> {
        return this.sendHttpRequest('POST', `/${url}/preferences/${run_uuid}`, data)
    }
}

const NETWORK = new Network(API_BASE_URL)
export default NETWORK
