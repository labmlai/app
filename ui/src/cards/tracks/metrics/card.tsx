import {CardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicCard, BasicView} from "../basic/card";

const ANALYSIS = 'Model Metrics'
const URL = 'metrics'
const TRACKING_NAME = 'getMetricsTracking'
const SERIES_PREFERENCE = 'metrics'


function Card(props: CardProps) {
    return <BasicCard tracking_name={TRACKING_NAME}
                      name={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      isChartView={true}
                      errorCallback={props.errorCallback}
                      lastUpdatedCallback={props.lastUpdatedCallback}
                      width={props.width}/>

}

function View() {
    const location = useLocation()

    return <BasicView tracking_name={TRACKING_NAME}
                      name={ANALYSIS}
                      series_preference={SERIES_PREFERENCE}
                      location={location}/>
}


export default {
    Card,
    View
}

