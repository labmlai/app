import React from "react"
import {Tab, Nav} from "react-bootstrap"
import RunsListView from "./runs_list_view";
import SettingsView from "./settings_view";
import {useLocation} from "react-router-dom"


import './tabs_view.scss'


function TabsView() {
    const location = useLocation()

    return <div className={'tab-container container'}>
        <Tab.Container defaultActiveKey="second">
            <div className={'tab'}>
                <Nav variant="pills">
                    <Nav.Item>
                        <Nav.Link eventKey="first">Tab 1</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            <div className={'tab'}>
                <Nav variant="pills">
                    <Nav.Item>
                        <Nav.Link eventKey="second">Tab 2</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            <div>
                <Tab.Content>
                    <Tab.Pane eventKey="first">
                       <SettingsView/>
                    </Tab.Pane>
                    <Tab.Pane eventKey="second">
                        <RunsListView location={location}/>
                    </Tab.Pane>
                </Tab.Content>
            </div>
        </Tab.Container>
    </div>
}

export default TabsView