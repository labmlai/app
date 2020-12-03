import React, {useEffect, useRef, useState} from "react"

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch} from "@fortawesome/free-solid-svg-icons"

import {ComputersList} from "../components/lists/computers_list"
import {EmptyComputersList} from "../components/lists/empty_computers_list"
import {LabLoader} from "../components/utils/loader"
import {ComputerListItemModel} from "../models/computer_list"
import CACHE from "../cache/cache"

import './runs_list_view.scss'


function ComputersListView() {
    const [isLoading, setIsLoading] = useState(true)
    const [computers, setComputers] = useState<ComputerListItemModel[]>([])
    const [labMlToken, setLabMlToken] = useState('')

    const computerListCache = CACHE.getComputersList()
    const inputElement = useRef(null) as any

    useEffect(() => {
        async function load() {
            let currentComputerList = await computerListCache.get()
            if (currentComputerList) {
                setComputers(currentComputerList.computers)
                setLabMlToken(currentComputerList.labml_token)
                setIsLoading(false)
            }
        }

        load().then()
    }, [computerListCache])


    useEffect(() => {
        document.title = "LabML: Computers"
    }, [labMlToken])

    function ComputersFilter(run: ComputerListItemModel, search: string) {
        let re = new RegExp(search.toLowerCase(), "g")
        let name = run.name.toLowerCase()
        let comment = run.comment.toLowerCase()

        return (name.search(re) !== -1 || comment.search(re) !== -1)
    }

    function handleChannelChange() {
        async function load() {
            if (inputElement.current) {
                let search = inputElement.current.value
                let currentComputersList = await computerListCache.get()
                let currentComputers = currentComputersList.computers

                currentComputers = currentComputers.filter((computer) => ComputersFilter(computer, search))
                setComputers(currentComputers)
            }
        }

        load().then()
    }

    function onDelete(computersSet: Set<string>) {
        let res: ComputerListItemModel[] = []
        for (let computer of computers) {
            if (!computersSet.has(computer.computer_uuid)) {
                res.push(computer)
            }
        }

        setComputers(res)
        computerListCache.deleteRuns(res, Array.from(computersSet)).then()
    }

    async function load() {
        let currentComputerList = await computerListCache.get(true)
        if (currentComputerList) {
            setComputers(currentComputerList.computers)
        }
    }

    function onRefresh() {
        load().then()
    }

    return <div>
        {(() => {
            if (isLoading) {
                return <LabLoader/>
            } else if (inputElement.current === null && computers.length === 0) {
                return <EmptyComputersList/>
            } else {
                return <div className={'runs-list'}>
                    {/*TODO: Change later to simple html & css*/}
                    <div className={"search-container mt-3 mb-2 px-2"}>
                        <div className={"search-content"}>
                            <span className={'icon'}>
                                <FontAwesomeIcon icon={faSearch}/>
                            </span>
                            <input
                                ref={inputElement}
                                onChange={handleChannelChange}
                                type={"search"}
                                placeholder={"Search"}
                                aria-label="Search"
                            />
                        </div>
                    </div>
                    <ComputersList computers={computers} onDelete={onDelete} onRefresh={onRefresh}/>
                </div>
            }
        })()}
    </div>
}

export default ComputersListView