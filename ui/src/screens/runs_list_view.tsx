import React, {useEffect, useRef, useState} from "react"

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faSearch} from "@fortawesome/free-solid-svg-icons"

import {ListItem} from "../components/lists/list"
import {EmptyRunsList} from "../components/lists/empty_runs_list"
import {LabLoader} from "../components/utils/loader"
import {RunListItemModel} from "../models/run_list"
import CACHE from "../cache/cache"

import './runs_list_view.scss'
import HamburgerMenuBar from "../components/utils/hamburger_menu"
import {DeleteButton, EditButton, RefreshButton} from "../components/utils/util_buttons"
import {ListGroup} from "react-bootstrap"


function RunsListView() {
    const [isLoading, setIsLoading] = useState(true)
    const [runs, setRuns] = useState<RunListItemModel[]>([])
    const [labMlToken, setLabMlToken] = useState('')

    const [isEditMode, setIsEditMode] = useState(false)

    const runListCache = CACHE.getRunsList()
    const inputElement = useRef(null) as any

    useEffect(() => {
        async function load() {
            let currentRunsList = await runListCache.getRunsList(null)
            if (currentRunsList) {
                setRuns(currentRunsList.runs)
                setLabMlToken(currentRunsList.labml_token)
                setIsLoading(false)
            }
        }

        load().then()
    }, [runListCache])


    useEffect(() => {
        document.title = "LabML: Experiments"
    }, [labMlToken])

    function runsFilter(run: RunListItemModel, search: string) {
        let re = new RegExp(search.toLowerCase(), "g")
        let name = run.name.toLowerCase()
        let comment = run.comment.toLowerCase()

        return (name.search(re) !== -1 || comment.search(re) !== -1)
    }

    function handleChannelChange() {
        async function load() {
            if (inputElement.current) {
                let search = inputElement.current.value
                let currentRunsList = await runListCache.getRunsList(null)
                let currentRuns = currentRunsList.runs

                currentRuns = currentRuns.filter((run) => runsFilter(run, search))
                setRuns(currentRuns)
            }
        }

        load().then()
    }

    let runsDeleteSet = new Set<string>()

    function onDelete() {
        let res: RunListItemModel[] = []
        for (let run of runs) {
            if (!runsDeleteSet.has(run.run_uuid)) {
                res.push(run)
            }
        }

        setRuns(res)
        runListCache.deleteRuns(res, Array.from(runsDeleteSet)).then()
        setIsEditMode(false)
    }

    function onItemClick(e: any, UUID: string) {
        if (runsDeleteSet.has(UUID)) {
            runsDeleteSet.delete(UUID)
        } else {
            runsDeleteSet.add(UUID)
        }
    }

    function onEdit() {
        setIsEditMode(true)
    }


    async function load() {
        let currentRunsList = await runListCache.getRunsList(null, true)
        if (currentRunsList) {
            setRuns(currentRunsList.runs)
        }
    }

    function onRefresh() {
        load().then()
    }

    return <div>
        <HamburgerMenuBar title={'Experiments'}>
            <div className={'mb-2 float-right d-flex'}>
                {runs.length > 0 && isEditMode && <DeleteButton onButtonClick={onDelete}/>}
                {runs.length > 0 && !isEditMode && <EditButton onButtonClick={onEdit}/>}
                {runs.length > 0 && <RefreshButton onButtonClick={onRefresh}/>}
            </div>
        </HamburgerMenuBar>
        {(() => {
            if (isLoading) {
                return <LabLoader/>
            } else if (inputElement.current === null && runs.length === 0) {
                return <EmptyRunsList/>
            } else {
                return <div className={'runs-list'}>
                    {/*TODO: Change later to simple html & css*/}
                    <div className={"search-container mt-3 mb-3 px-2"}>
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
                    <ListGroup className={"list"}>
                        {runs.map((item, idx) => (
                            <ListItem key={item.run_uuid} idx={idx} item={item} onItemClick={onItemClick}
                                      isEditMode={isEditMode} itemKey={'run'}/>
                        ))}
                    </ListGroup>
                </div>
            }
        })()}
    </div>
}

export default RunsListView