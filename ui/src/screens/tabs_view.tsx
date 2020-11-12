import React, {useState} from "react"
import {Nav} from "react-bootstrap"
import RunsListView from "../screens/runs_list_view"
import SettingsView from "../screens/settings_view"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHome, faUserCircle} from "@fortawesome/free-solid-svg-icons"

import './tabs_view.scss'

function TabsView() {
    const [isRunsList, setIsRunsList] = useState(true)


    function clickHandle(e: any, tab: string) {
        if (tab === 'user') {
            setIsRunsList(false)
        } else {
            setIsRunsList(true)
        }
    }

    return <div>
        <div className={'flex-container tab-view'}>
            <Nav.Link eventKey="second" className={'tab'} onClick={(e: any) => clickHandle(e, 'run_list')}>
                <FontAwesomeIcon icon={faHome}/>
                <span>Home</span>
            </Nav.Link>
            <Nav.Link eventKey="first" className={'tab'} onClick={(e: any) => clickHandle(e, 'user')}>
                <FontAwesomeIcon icon={faUserCircle}/>
                <span>User</span>
            </Nav.Link>
        </div>
        {isRunsList ? <RunsListView/> : <SettingsView/>}
    </div>

}

export default TabsView