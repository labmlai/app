import React from "react"
import {Tab, Nav} from "react-bootstrap"
import RunsListView from "./runs_list_view";
import SettingsView from "./settings_view";
import {useLocation} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faUserCircle} from "@fortawesome/free-solid-svg-icons";


import './tabs_view.scss'


function TabsView() {
    const location = useLocation()

    return <div>
        <Tab.Container defaultActiveKey="second">
            <div className={'flex-container tab-view'}>
                <Nav.Link eventKey="second"  className={'tab'}>
                    <FontAwesomeIcon icon={faHome}/>
                    <span>Home</span>
                </Nav.Link>
                <Nav.Link eventKey="first" className={'tab'}>
                    <FontAwesomeIcon icon={faUserCircle}/>
                    <span>User</span>
                </Nav.Link>
            </div>
            <Tab.Content>
                <Tab.Pane eventKey="first">
                    <SettingsView/>
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                    <RunsListView location={location}/>
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </div>
}

export default TabsView