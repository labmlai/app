import React, {useEffect, useState} from "react"

import {Nav} from "react-bootstrap"

import {PyTorchCode, KerasCode, PyTorchLightningCode} from "../codes/code"
import {Footer} from '../utils/footer'
import {LabLoader} from "../utils/loader"
import CACHE from "../../cache/cache"
import {RunListItemModel} from "../../models/run_list"
import {List} from "./list"

import "./empty_runs_list.scss"


export function EmptyRunsList() {
    const [runs, setRuns] = useState<RunListItemModel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentTab, setCurrentTab] = useState('pytoch')

    useEffect(() => {
        const samples_token: string = process.env.REACT_APP_SAMPLES_PROJECT_TOKEN !

        const runListCache = CACHE.getRunsList()

        async function load() {
            let currentRunsList = await runListCache.get(false, samples_token)
            if (currentRunsList) {
                setRuns(currentRunsList.runs)
                setIsLoading(false)
            }
        }

        load().then()
    }, [])

    function clickHandle(e: any, tab: string) {
        setCurrentTab(tab)
    }


    return <div>
        <div className={'text-center'}>
            <h5 className={'mt-4 px-1'}>You will see your experiments here</h5>
            <p className={'px-1'}>Start monitoring your models by adding just two lines of
                code:</p>
        </div>
        <div className={'text-center'}>
            <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'pytoch')}>
                PyTorch
            </Nav.Link>
            <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'lightning')}>
                PyTorch Lightning
            </Nav.Link>
            <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'keras')}>
                Keras
            </Nav.Link>
        </div>
        {(() => {
            if (currentTab === 'pytoch') {
                return <PyTorchCode/>
            } else if (currentTab === 'keras') {
                return <KerasCode/>
            } else {
                return <PyTorchLightningCode/>
            }
        })()}
        <div className={'text-center my-4'}>
            <h5 className={'title'}>Sample experiments</h5>
        </div>
        {isLoading ?
            <LabLoader/>
            :
            <List items={runs} onItemClick={() => {
            }} isEditMode={false} itemKey={'run'}/>
        }
        <div className={'mt-5'}>
            <Footer/>
        </div>
    </div>
}


