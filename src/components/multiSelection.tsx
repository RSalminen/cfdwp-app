import { Dispatch, SetStateAction, useState } from "react";
import useComponentVisible from "../hooks/useComponentIsVisible";

const MultiSelection = ({selectedItems, setSelectedItems, thisItem, allItems}: {thisItem:string, selectedItems:string[], setSelectedItems:Dispatch<SetStateAction<string[] | null>>, allItems:string[]}) => {
    
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

    const addItem = (str : string) => {
        if (selectedItems.includes(str)) {
            setSelectedItems(selectedItems.filter((farea) => farea !== str));
            return;
        }

        const newitems = selectedItems.concat(str);
        setSelectedItems(newitems);
    }

    return (
        <div className="w-full relative">
            <div ref={ref} className="my-2">
                <div className="py-2 px-2 flex items-center text-[15px] lg:hover:cursor-pointer border border-black w-full rounded-t-sm" onClick={() => setIsComponentVisible(!isComponentVisible)}>
                    {selectedItems.length === 0 ?
                    <div className="text-gray-600">Select Fields...</div>
                    :
                    <div className='w-full flex flex-wrap'>{selectedItems.map((item:string) => 
                        <div className="flex items-center text-[11px] text-black mx-0.5 pl-1 pr-[2px] bg-gray-300 rounded-[2px]">
                            <p className="pb-[1px]">{item}</p>
                            <svg onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItems(allItems.filter((fItem) => fItem != item));
                            }} className="h-2" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
                        </div>
                    )}
                    </div>
                }
                </div>
                {(isComponentVisible) &&
                    <div className="absolute z-[3] w-full border-b border-x border-black shadow-lg shadow-gray-300">
                        
                        <div className="relative">
                            <div className="min-h-fit max-h-[300px] overflow-y-auto pb-[1px]">
                                <div onClick={() => selectedItems.length === allItems.length ? setSelectedItems([]) : setSelectedItems(allItems)} className={`block text-[13px] px-2.5 py-1 w-full lg:hover:bg-gray-400 lg:hover:cursor-pointer ${selectedItems.length === allItems.length ? "bg-blue-100" : "bg-white"}`}>All fields</div>
                                
                                {allItems.map((item:string) => 
                                    <div key={item} onClick={() => addItem(item)} className={`my-[-1px] text-[13px] h-[30px] px-2.5 py-1 w-full ${!selectedItems.includes(item) && "lg:hover:bg-gray-400"} lg:hover:cursor-pointer ${selectedItems.includes(item) ? "bg-blue-100" : "bg-white"}`}>{item}</div>
                                )}
                            </div>
                        </div>
                    </div>            
                }
            </div>
            
        </div>

    )
}

export default MultiSelection;