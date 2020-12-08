import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch} from "@fortawesome/free-solid-svg-icons"
import React from "react"

interface SearchProps {
    inputElement: any
    onInputChange: (e: any) => void
}

function Search(props: SearchProps) {
    return <div className={"search-container mt-3 mb-3 px-2"}>
        <div className={"search-content"}>
            <span className={'icon'}><FontAwesomeIcon icon={faSearch}/></span>
            <input
                ref={props.inputElement}
                onChange={props.onInputChange}
                type={"search"}
                placeholder={"Search"}
                aria-label="Search"
            />
        </div>
    </div>

}

export default Search