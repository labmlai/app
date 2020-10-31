import {SeriesCardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicCard, BasicView} from "../basic/card";

const ANALYSIS = 'Outputs - L2 Norm'
const URL = 'modules'
const TRACKING_NAME = 'getModulesTracking'
const SERIES_PREFERENCE = 'modules'

function Card(props: SeriesCardProps) {
    return <BasicCard tracking_name={TRACKING_NAME}
                      name={ANALYSIS}
                      uuid={props.uuid}
                      url={URL}
                      ref={props.refreshRef}
                      isChartView={false}
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
