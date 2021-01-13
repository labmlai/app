import React, {useEffect, useRef, useState} from "react"

import {List} from "../components/lists/list"
import {LabLoader} from "../components/utils/loader"
import {ComputerListItemModel} from "../models/computer_list"
import CACHE from "../cache/cache"
import HamburgerMenuBar from "../components/utils/hamburger_menu"
import Search from "../components/utils/search"
import {DeleteButton, EditButton, RefreshButton, CancelButton} from "../components/utils/util_buttons"
import {EmptyComputersList} from "../components/lists/empty_computers_list"

import './runs_list_view.scss'


function ComputersListView() {
    const [isLoading, setIsLoading] = useState(true)
    const [computers, setComputers] = useState<ComputerListItemModel[]>([])
    const [isEditMode, setIsEditMode] = useState(false)

    const computerListCache = CACHE.getComputersList()

    const inputElement = useRef(null) as any

    useEffect(() => {
        async function load() {
            let currentComputerList = await computerListCache.get()
            if (currentComputerList) {
                setComputers(currentComputerList.computers)
                setIsLoading(false)
            }
        }

        load().then()
    }, [computerListCache])


    useEffect(() => {
        document.title = "LabML: Computers"
    }, [])

    function ComputersFilter(run: ComputerListItemModel, search: string) {
        let re = new RegExp(search.toLowerCase(), "g")
        let name = run.name.toLowerCase()
        let comment = run.comment.toLowerCase()

        return (name.search(re) !== -1 || comment.search(re) !== -1)
    }

    function onInputChange() {
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

    let computersDeleteSet = new Set<string>()

    function onToggleEdit() {
        setIsEditMode(!isEditMode)
    }

    function onDelete() {
        async function load() {
            let currentComputersList = await computerListCache.get()
            let currentComputers = currentComputersList.computers

            let res: ComputerListItemModel[] = []
            for (let computer of currentComputers) {
                if (!computersDeleteSet.has(computer.session_uuid)) {
                    res.push(computer)
                }
            }

            setComputers(res)
            computerListCache.deleteComputers(res, Array.from(computersDeleteSet)).then()
        }

        load().then()
        onToggleEdit()
        onInputChange()
    }

    function onItemClick(e: any, UUID: string) {
        if (computersDeleteSet.has(UUID)) {
            computersDeleteSet.delete(UUID)
        } else {
            computersDeleteSet.add(UUID)
        }
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

    const view = 'Computer List View'

    return <div>
        <HamburgerMenuBar title={'Computers'}>
            <div className={'mb-2 float-right d-flex'}>
                {computers.length > 0 && isEditMode && <DeleteButton onButtonClick={onDelete} parent={view}/>}
                {computers.length > 0 && !isEditMode && <EditButton onButtonClick={onToggleEdit} parent={view}/>}
                {computers.length > 0 && !isEditMode && <RefreshButton onButtonClick={onRefresh} parent={view}/>}
                {computers.length > 0 && isEditMode && <CancelButton onButtonClick={onToggleEdit} parent={view}/>}
            </div>
        </HamburgerMenuBar>
        {(() => {
            if (isLoading) {
                return <LabLoader/>
            } else if (inputElement.current === null && computers.length === 0) {
                return <EmptyComputersList/>
            } else {
                return <div className={'runs-list'}>
                    <Search inputElement={inputElement} onInputChange={onInputChange}/>
                    <List items={computers} onItemClick={onItemClick} isEditMode={isEditMode} itemKey={'session'}/>
                </div>
            }
        })()}
    </div>
}

export default ComputersListView