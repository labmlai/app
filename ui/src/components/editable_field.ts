import {WeyaElementFunction} from '../../../lib/weya/weya'


interface EditableFieldOptions {
    name: string
    value: any
    placeholder?: string
    isEditable?: boolean
    numEditRows?: number
}

export default class EditableField {
    name: string
    value: any
    placeholder: string
    isEditable: boolean
    numEditRows: number

    constructor(opt: EditableFieldOptions) {
        this.name = opt.name
        this.value = opt.value
        this.placeholder = opt.placeholder
        this.isEditable = opt.isEditable
        this.numEditRows = opt.numEditRows
    }

    render($: WeyaElementFunction) {
        $(`li`, $ => {
            $('span.item-key', this.name)
            if (this.isEditable) {
                $('div.input-container.mt-2', $ => {
                    $('div.input-content', $ => {
                        if (this.numEditRows) {
                            $('textarea', {
                                    rows: this.numEditRows,
                                    placeholder: this.placeholder,
                                    defaultValue: this.value
                                }
                            )
                        } else {
                            $('input', {
                                    placeholder: this.placeholder,
                                    defaultValue: this.value
                                }
                            )
                        }
                    })
                })
            } else {
                $('span.item-value', this.value)
            }
        })
    }
}