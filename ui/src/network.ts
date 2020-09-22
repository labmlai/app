import axios from 'axios';

class NETWORK {
    static async get_run(run_uuid: string): Promise<any> {
        return axios.get(`${process.env.REACT_APP_SERVER_URL}/run/${run_uuid}`, {})
    }

    static async get_tracking(run_uuid: string): Promise<any> {
        return axios.post(`${process.env.REACT_APP_SERVER_URL}/track/${run_uuid}`, {})
    }

    static async get_runs(labml_token: string): Promise<any> {
        return axios.get(`${process.env.REACT_APP_SERVER_URL}/runs/${labml_token}`, {})
    }

    static async google_sign_in(token: string): Promise<any> {
        const options = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}

        return axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/google/sign_in`, {'token': token})
    }
}

export default NETWORK
