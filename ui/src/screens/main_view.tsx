import React, {useState, useEffect} from "react"
import CopyToClipboard from 'react-copy-to-clipboard'
import Swal from "sweetalert2"
import {StyleSheet, css} from "aphrodite"
import {
    Image,
    Button,
    Card,
    Container
} from 'react-bootstrap'

import NETWORK from '../network'
import imageSrc from '../assets/merge.png'

import stepOne from '../assets/steps/step_1.png'
import stepTwo from '../assets/steps/step_2.png'
import stepThree from '../assets/steps/step_3.png'
import stepFour from '../assets/steps/step_4.png'

interface MainProps {
    location: any
}

interface StepProps {
    image: any
    step: string
    instructions: Array<string>
}

function Step(props: StepProps) {
    return <div>
        <h2 className={"mt-3 text-secondary"}>{props.step}</h2>
        <div className="row mt-4">
            <div className="col">
                <Image src={props.image}/>
            </div>
            <div className={"col text-left align-self-center text-dark"}>
                <ul>
                    {props.instructions.map((instruction, index) =>
                        <li key={index}><h5>{instruction}</h5></li>
                    )}
                </ul>
            </div>
        </div>
    </div>
}

function MainView(props: MainProps) {
    const [message, setMessage] = useState('')
    const [isCopied, setIsCopied] = useState(false)

    const params = new URLSearchParams(props.location.search)
    const labMlToken = params.get('labml_token')

    useEffect(() => {
        if (labMlToken) {
            //TODO verify first
            setMessage(`${process.env.REACT_APP_SERVER_URL}/track?labml_token=${labMlToken}&channel=YOUR_SLACK_CHANNEL`)
        }
    }, [labMlToken]);

    const onSubmit = () => {
        NETWORK.authorize().then((res) => {
            window.location.href = res.data.uri;
        }).catch((error) => {
            Swal.fire('Authorization Failed!', `${error}`, 'error');
        })
    }

    return <div>
        <div className={"container-lg text-center mt-5 mb-5"}>
            <h1 className={"display-3 mb-1"}>Get Model Training Updates in Slack</h1>
             <h3 className={"text-secondary mb-5"}>An open source library to push charts and updates of your ML/DL model training to Slack</h3>
            <Image src={imageSrc}/>
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
                    <div className={"mt-5 mb-5"}>
                        <button className={"submit-btn"} onClick={onSubmit}>
                            <img alt="Add to Slack" height="50" width="139"
                                 src="https://platform.slack-edge.com/img/add_to_slack.png"
                                 srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/>
                        </button>
                    </div>
                }
                <ul className={css(styles.list)}>
                    <li key='1'><Step step={'Step 1'} image={stepOne}
                                      instructions={['Click on `Add to Slack button` and generate a URL.']}/></li>
                    <li key='2'><Step step={'Step 2'} image={stepTwo}
                                      instructions={['Add LabML App to your channel.']}/></li>
                    <li key='3'><Step step={'Step 3'} image={stepThree}
                                      instructions={['Run the Hello World Example.', "And don't forget to change the channel parameter."]}/></li>
                    <li key='4'><Step step={'Step 4'} image={stepFour}
                                      instructions={['Check logs in your Slack channel.']}/></li>
                </ul>
            </div>
            <iframe width="700"
                    height="415"
                    src="https://www.youtube.com/embed/FY3e1EHqwEE"
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen/>
        </div>
        <div className={css(styles.container)}>
            <Container className={"text-center pt-5"}>
                <h1>LabML Notifications</h1>
                <p className={"col-md-6 mx-auto"}>
                    For real-time updates of your machine learning model training in Slack. Faster decision making on
                    models and expedite your project completion.
                </p>
                <h3 className={"mt-5"}>Connect with us</h3>
                <a href="https://github.com/lab-ml">Github</a>
                <p></p>
                <a href="https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/">Slack
                    Workspace for discussion</a>
            </Container>
        </div>
    </div>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e6e6e6',
        height: '350px',
        minHeight: '100%',
    },

    list: {
        listStyleType: 'none'
    }
});

export default MainView
