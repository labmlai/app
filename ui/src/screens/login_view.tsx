import React, {useState} from "react"
import {useHistory} from "react-router-dom";
import Swal from "sweetalert2"
import {
    Image,
    Button,
    FormControl,
} from 'react-bootstrap'

import NETWORK from '../network'
import imageSrc from '../assets/lab_cover.png'
import {Footer} from '../components/footer'

function LoginView() {
    const history = useHistory();
    const [userInput, setUserInput] = useState('')

    const onGoToExperiments = () => {
        if (userInput) {
            NETWORK.get_user_validation(userInput).then((res) => {
                if (res.data.valid) {
                    history.push(`/runs?labml_token=${userInput}`)
                } else {
                    Swal.fire('Invalid Token!', 'error')
                }
            })
        } else {
            Swal.fire('Empty Token!', 'error')
        }
    }

    function onGenerateToken() {
        NETWORK.authorize().then((res) => {
            window.location.href = res.data.uri;
        }).catch((error) => {
            Swal.fire('Authorization Failed!', `${error}`, 'error')
        })
    }

    const handleTokenChange = (e: any) => {
        setUserInput(e.target.value)
    }

    return <div>
        <div className={"container-sm text-center mb-2"}>
            <h2>Get Model Training Updates in Mobile</h2>
            <h5 className={"text-secondary"}>An open-source library to push updates of your ML/DL model training to
                mobile</h5>
            <Image src={imageSrc} rounded/>
            <div className={"w-50 mx-auto"}>
                <FormControl type='text' placeholder="If you already have generated a Token, Enter here"
                             onChange={handleTokenChange}/>
                <Button className={"mt-2 button-theme"} onClick={onGoToExperiments}>
                    Go to Experiments
                </Button>
                <h4 className={"mt-1"}>or</h4>
                <Button className={"mt-1 button-theme"} onClick={onGenerateToken}>
                    Generate a Token
                </Button>
            </div>
        </div>
        <Footer/>
    </div>
}

export default LoginView
