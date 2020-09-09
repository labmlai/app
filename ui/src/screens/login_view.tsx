import React, {useState, useEffect} from "react"
import {useHistory} from "react-router-dom";
import Swal from "sweetalert2"
import {
    Image,
    Button,
    FormControl,
} from 'react-bootstrap'

import NETWORK from '../network'
import imageSrc from '../assets/lab_cover.png'


function LoginView() {
    const history = useHistory();
    const [userInput, setUserInput] = useState('')

    const onSubmit = () => {
        if (userInput) {
            history.push(`/runs?labml_token=${userInput}`)
        } else {
            NETWORK.authorize().then((res) => {
                window.location.href = res.data.uri;
            }).catch((error) => {
                Swal.fire('Authorization Failed!', `${error}`, 'error')
            })
        }
    }

    const handleTokenChange = (e: any) => {
        setUserInput(e.target.value)
    }

    return <div>
        <div className={"container-sm text-center mb-3"}>
            <h2>Get Model Training Updates in Mobile</h2>
            <h5 className={"text-secondary"}>An open-source library to push updates of your ML/DL model training to
                mobile</h5>
            <Image src={imageSrc} rounded/>
            <div className={"w-75 mx-auto"}>
                <div className={"w-50 mx-auto"}>
                    <FormControl type='text' placeholder="If you already have generated a LabMLToken, enter here"
                                 onChange={handleTokenChange}/>
                    <Button className={"mt-3 button-theme"} onClick={onSubmit}>
                        Try it Out
                    </Button>
                </div>
            </div>
        </div>
        <div>
            <div className={"text-center"}>
                <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
                <span> | </span>
                <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
                <span> | </span>
                <a href="https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/">Slack
                    Workspace for discussion</a>
            </div>
        </div>
    </div>
}

export default LoginView
