import React from "react"
import Loader from 'react-loader-spinner'
import './loader.scss'

export function LabLoader() {
    return <div className={'loader'}>
        <Loader
            type="Oval"
            color="#eb6134"
            height={50}
            width={50}
            visible={true}
        />
    </div>
}