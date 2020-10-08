import React from "react"
import Loader from 'react-loader-spinner'
import './loader.scss'

interface LabLoaderProps {
    isLoading: boolean
}

export function LabLoader(props: LabLoaderProps) {
    return <div className={'loader'}>
        <Loader
            type="Bars"
            color="#eb6134"
            height={75}
            width={75}
            visible={props.isLoading}
        />
    </div>
}