import React from "react";
import "./style.scss"
import {FormattedValue} from "../../components/value";
import {Config} from "../../models/config";

const CONFIG_PRINT_LEN = 20
const KEY_WIDTH = 125
const PADDING = 11

function ComputedValue(props: { computed: any }) {
    if (typeof props.computed !== 'string') {
        return <span className={'computed'}>
            <FormattedValue value={props.computed}/>
        </span>
    }

    let computed: string = props.computed
    computed = computed.replace('\n', '')
    if (computed.length < CONFIG_PRINT_LEN) {
        return <span className={'computed'}>{computed}</span>
    }

    let truncated = computed.substr(0, CONFIG_PRINT_LEN) + '...'
    let split = computed.split('.')
    if (computed.indexOf(' ') === -1 && split.length > 1) {
        truncated = '...' + split[split.length - 1]
        if (truncated.length > CONFIG_PRINT_LEN) {
            truncated = truncated.substr(0, CONFIG_PRINT_LEN) + '...'
        }
    }

    return <span className={'computed'}>
        <span title={computed}>{truncated}</span>
    </span>
}

function Option(props: { value: any }) {
    return <span className={'option'}>{props.value}</span>
}

function OtherOptions(props: { options: any[] }) {
    let options = props.options
    if (options.length === 0) {
        return null
    }

    return <span className={'options'}>
        {options
            .filter((o => typeof o === 'string'))
            .map((o) => <span key={o}>{o}</span>)
        }
    </span>
}

interface ConfigItemProps {
    config: Config
    configs: Config[]
    width: number
}

function ConfigItemView(props: ConfigItemProps) {
    let conf = props.config
    let configs: { [key: string]: Config } = {}
    for (let c of props.configs) {
        configs[c.key] = c
    }

    let isCollapsible = false
    let classes = ['info_list config']

    let computedElem = null
    let optionElem = null
    let otherOptionsElem = null

    let prefix = ''
    let parentKey = ''
    let isParentDefault = false
    let conf_modules = conf.key.split('.')
    for (let i = 0; i < conf_modules.length - 1; ++i) {
        parentKey += conf_modules[i]
        if (configs[parentKey].isDefault) {
            isParentDefault = true
        }
        parentKey += '.'
        prefix += '--- '
    }

    if (conf.order < 0) {
        classes.push('ignored')
        isCollapsible = true
    } else {
        computedElem = <ComputedValue computed={conf.computed}/>

        if (conf.isCustom) {
            if (isParentDefault && !conf.isExplicitlySpecified && !conf.isHyperparam) {
                classes.push('.only_option')
                isCollapsible = true
            } else {
                classes.push('.custom')
            }
        } else {
            optionElem = <Option value={conf.value}/>
            if (!conf.isExplicitlySpecified && !conf.isHyperparam && (isParentDefault || conf.isOnlyOption)) {
                classes.push('.only_option')
                isCollapsible = true
            } else {
                classes.push('.picked')
            }
        }

        otherOptionsElem = <OtherOptions options = {[...conf.otherOptions]} />

        if (conf.isHyperparam) {
            classes.push('hyperparam')
        } else if (conf.isExplicitlySpecified) {
            classes.push('specified')
        } else {
            classes.push('not-hyperparam')
        }
    }

    if (conf.isMeta) {
        return null
    }

    if (isCollapsible) {
        return null
        // classes.push('collapsible')
    } else {
        classes.push('not_collapsible')
    }

    return <div className={classes.join(' ')}>
        <span className={'key'}>{prefix + conf.name}</span>
        <span className={'combined'}
              style={{width: `${props.width - KEY_WIDTH - 2 * PADDING}px`}}>
            {computedElem}
            {optionElem}
            {/*{otherOptionsElem}*/}
        </span>
    </div>
}

interface ConfigsProps {
    configs: Config[]
    width: number
}


export function ConfigsView(props: ConfigsProps) {
    let configs = props.configs

    configs.sort((a, b) => {
        if (a.key < b.key) return -1;
        else if (a.key > b.key) return +1;
        else return 0
    })

    let style = {
        width: `${props.width}px`
    }
    return <div className={"configs block collapsed"} style={style}>
        <h3>Configurations</h3>
        {configs.map((c) => <ConfigItemView key={c.key} config={c} configs={configs}
                                            width={props.width}/>)}
    </div>
}
