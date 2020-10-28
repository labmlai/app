import {CardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicView, BasicCard} from "../basic/card";

const ANALYSIS = 'Model Gradients'
const URL = 'grads'
const TRACKING_NAME = 'getGradsTracking'
const SERIES_PREFERENCE = 'grads'

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
                      series_preference={SERIES_PREFERENCE}
                      location={location}/>
}

export default {
    Card,
    View
}