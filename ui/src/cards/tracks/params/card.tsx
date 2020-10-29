import {CardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicCard, BasicView} from "../basic/card";

const ANALYSIS = 'Model Parameters'
const URL = 'params'
const TRACKING_NAME = 'getParamsTracking'
const SERIES_PREFERENCE = 'params'

function Card(props: CardProps) {
    return <BasicCard tracking_name={TRACKING_NAME}
                      name={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      isChartView={false}
                      errorCallback={props.errorCallback}
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
