import {WeyaElementFunction} from '../../../../lib/weya/weya'

interface EditableSelectFieldOptions {
    name: string
    value: any
    values: [any, any][]
    placeholder?: string
    isEditable?: boolean
}

export default class EditableSelectField {
    name: string
    value: any
    values: [any, any][]
    placeholder: string
    isEditable: boolean
    inputElem: HTMLSelectElement

    constructor(opt: EditableSelectFieldOptions) {
        this.name = opt.name
        this.value = opt.value
        this.values = opt.values
        this.placeholder = opt.placeholder
        this.isEditable = opt.isEditable
    }

    getInput() {
        return this.inputElem.value
    }

    render($: WeyaElementFunction) {
        $(`li`, $ => {
            $('span.item-key', this.name)
            if (this.isEditable) {
                $('div.input-container.mt-2', $ => {
                    $('div.input-content', $ => {
                        this.inputElem = $('select', {
                                value: this.value
                            }, $ => {
                                $('option')
                                this.values.forEach(entry => {
                                    $('option', {value: entry[0]}, entry[1])
                                })
                            }
                        )
                    })
                })
            } else {
                $('span.item-value', this.value)
            }
        })
    }
}
