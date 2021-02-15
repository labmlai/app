import {WeyaElementFunction} from '../../../lib/weya/weya'
import Timeout = NodeJS.Timeout;

export interface SearchOptions {
    onSearch: (query: string) => void
}

export class SearchView {
    onSearch: () => void
    textbox: HTMLInputElement
    inputTimeout: Timeout

    constructor(opt: SearchOptions) {
        this.onSearch = () => {
            clearTimeout(this.inputTimeout)
            this.inputTimeout = setTimeout(()=>{
                opt.onSearch(this.textbox.value)
            }, 250);
        }
    }

    render($: WeyaElementFunction) {
        $('div', '.search-container', $ => {
            $('span.fas.fa-search', '')
            this.textbox = <HTMLInputElement>$('input', {
                    type: 'search',
                    placeholder: 'Search',
                    'aria-label': 'Search',
                    on: {
                        input: this.onSearch
                    },
                'class':'search-input'
                }
            )
        })
    }
}
