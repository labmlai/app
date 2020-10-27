import {CardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicCard, BasicView} from "../basic/card";

const ANALYSIS = 'Time Tracking'
const URL = 'times'
const TRACKING_NAME = 'getTimesTracking'

function Card(props: CardProps) {
    return <BasicCard tracking_name={TRACKING_NAME}
                      name={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      isChartView={false}
                      errorCallback={props.errorCallback}
                      lastUpdatedCallback={props.lastUpdatedCallback}
                      width={props.width}/>

}

function View() {
    const location = useLocation()

    return <BasicView tracking_name={TRACKING_NAME}
                      name={ANALYSIS}
                      location={location}/>
}

export default {
    Card,
    View
}