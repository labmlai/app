import React from "react"
import Loader from 'react-loader-spinner'
import './loader.scss'

interface LabLoaderProps {
    isLoading: boolean
}

export function LabLoader(props: LabLoaderProps) {
    return <div className={'loader'}>
        <Loader
            type="Oval"
            color="#eb6134"
            height={50}
            width={50}
            visible={props.isLoading}
        />
    </div>
}