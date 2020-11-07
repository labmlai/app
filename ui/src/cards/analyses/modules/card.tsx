import {SeriesCardProps} from "../../types";
import React from "react";
import {useLocation} from "react-router-dom";
import {BasicCard, BasicView} from "../basic/card";

const ANALYSIS_NAME = 'Outputs - L2 Norm'
const ANALYSIS = 'modules'
const URL = 'modules'

function Card(props: SeriesCardProps) {
    return <BasicCard analysis={ANALYSIS}
                      name={ANALYSIS_NAME}
                      uuid={props.uuid}
                      url={URL}
                      ref={props.refreshRef}
                      isChartView={false}
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
