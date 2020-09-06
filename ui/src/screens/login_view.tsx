import React, {useState, useEffect} from "react"
import CopyToClipboard from 'react-copy-to-clipboard'
import Swal from "sweetalert2"
import {StyleSheet, css} from "aphrodite"
import {
    Image,
    Button,
    Card,
    Container,
    FormControl,
    InputGroup
} from 'react-bootstrap'

import NETWORK from '../network'
import imageSrc from '../assets/lab_cover.png'


interface MainProps {
    location: any
}

function MainView(props: MainProps) {
    const [message, setMessage] = useState('')
    const [userInput, setUserInput] = useState('')
    const [isCopied, setIsCopied] = useState(false)

    const params = new URLSearchParams(props.location.search)
    const labMlToken = params.get('labml_token')

    useEffect(() => {
        if (labMlToken) {
            setMessage(`${process.env.REACT_APP_SERVER_URL}/track?labml_token=${labMlToken}`)
        }
    }, [labMlToken]);

    const onSubmit = () => {
        NETWORK.authorize().then((res) => {
            window.location.href = res.data.uri;
        }).catch((error) => {
            Swal.fire('Authorization Failed!', `${error}`, 'error');
        })
    }

    const handleTokenChange = (e: any) => {
        setUserInput(e.target.value)
    }

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            window.location.href = `/runs?labml_token=${userInput}`;
        }
    }

    return <div>
        <div className={"container-lg text-center mt-5 mb-5"}>
            <h1 className={"display-3 mb-1"}>Get Model Training Updates in Mobile</h1>
            <h3 className={"text-secondary mb-5"}>An open-source library to push updates of your ML/DL model training to
                mobile</h3>
            <Image src={imageSrc} rounded/>
            <div className={"w-75 mx-auto"}>
                {labMlToken
                    ? <Card className={"mt-5"}>
                        <Card.Body>
                            <Card.Title><h2>Your web_api URL is</h2></Card.Title>
                            <Card.Text>
                                <h6 className={"text-secondary mt-3"}>{message}</h6>
                            </Card.Text>
                            <CopyToClipboard text={message} onCopy={() => setIsCopied(true)}>
                                <Button className={"mt-3 button-theme"}> {isCopied ? 'URL Copied' : 'Copy URL'}</Button>
                            </CopyToClipboard>
                        </Card.Body>
                    </Card>
                    :
                    <div className={"mt-5 w-50 mx-auto"}>
                        <Button className={"button-theme"} onClick={onSubmit} size="lg">
                            Try it Out
                        </Button>
                        <h2 className={"text-secondary mt-3"}> or </h2>
                        <InputGroup className="mt-3">
                            <FormControl type='text' placeholder="Enter your LabML token and press Enter"
                                         onChange={handleTokenChange} onKeyDown={handleKeyDown}/>
                        </InputGroup>
                    </div>
                }
            </div>
        </div>
        <div className={css(styles.container)}>
            <Container className={"text-center pt-5"}>
                <a href={'https://github.com/lab-ml/labml'}>LabML Github Repo</a>
                <span> | </span>
                <a href={'https://github.com/lab-ml/app'}>LabML App Github Repo</a>
                <span> | </span>
                <a href="https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/">Slack
                    Workspace for discussion</a>
            </Container>
        </div>
    </div>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e6e6e6',
        height: '150px',
    }
});

export default MainView
