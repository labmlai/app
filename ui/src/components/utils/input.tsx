import React, {forwardRef} from "react"

import "./input.scss"

interface InputEditableProps {
    item: string
    value: any
    placeholder?: string
    ref: any
    isEditable?: boolean
}

function InputElem(props: InputEditableProps, ref: any) {
    return <li>
            <span className={'item-key'}>
            {props.item}
        </span>
        {props.isEditable ?
            <div className={'input-container mt-2'}>
                <div className={'input-content'}>
                    <input defaultValue={props.value} ref={ref} placeholder={props.placeholder}/>
                </div>
            </div>
            :
            <span className={'item-value'}>
             {props.value}
        </span>
        }
    </li>
}

let InputEditable = forwardRef(InputElem)

export default InputEditable