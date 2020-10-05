import React from "react"
import {Tab, Nav} from "react-bootstrap"
import RunsListView from "./runs_list_view";
import SettingsView from "./settings_view";
import {useLocation} from "react-router-dom"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faSlidersH} from "@fortawesome/free-solid-svg-icons";


import './tabs_view.scss'


function TabsView() {
    const location = useLocation()

    return <div>
        <Tab.Container defaultActiveKey="second">
            <div className={'flex-container'}>
                <Nav.Link eventKey="first" className={'tab'}>
                    <FontAwesomeIcon icon={faSlidersH}/>
                </Nav.Link>
                <Nav.Link eventKey="second"  className={'tab'}>
                    <FontAwesomeIcon icon={faHome}/>
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