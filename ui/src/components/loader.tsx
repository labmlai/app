import React from "react"
import Loader from 'react-loader-spinner'

interface LabLoaderProps {
    isLoading: boolean
}

export function LabLoader(props: LabLoaderProps) {
    return <div className={'loader'}>
        <Loader
            type="Bars"
            color="#eb6134"
            height={100}
            width={100}
            visible={props.isLoading}
        />
    </div>
}