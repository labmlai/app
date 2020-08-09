import axios from 'axios';

class NETWORK {
    static async authorize(): Promise<any> {
        console.log(process.env)
        return axios.post(`${process.env.REACT_APP_SERVER_URL}/signup`, {})
    }

    static async get_run(run_uuid: string): Promise<any> {
        return axios.get(`${process.env.REACT_APP_SERVER_URL}/run/${run_uuid}`, {})
    }

    static async get_tracking(run_uuid: string): Promise<any> {
        return axios.post(`${process.env.REACT_APP_SERVER_URL}/track/${run_uuid}`, {})
    }
}

export default NETWORK
