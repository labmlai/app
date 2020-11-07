import {SeriesCardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicCard, BasicView} from "../basic/card";

const ANALYSIS_NAME = 'Time Tracking'
const ANALYSIS = 'times'
const URL = 'times'

function Card(props: SeriesCardProps) {
    return <BasicCard analysis={ANALYSIS}
                      name={ANALYSIS_NAME}
                      uuid={props.uuid}
                      url={URL}
                      isChartView={false}
                      ref={props.refreshRef}
                      width={props.width}/>

}

function View() {
    const location = useLocation()

    return <BasicView analysis={ANALYSIS}
                      name={ANALYSIS_NAME}
                      series_preference={ANALYSIS}
                      location={location}/>
}

export default {
    Card,
    View
}
