import { Dispatch, SetStateAction, useState } from "react";
import useComponentVisible from "../hooks/useComponentIsVisible";

const Selection = ({selectedItem, setSelectedItem, thisItem, allItems}: {thisItem:string | null, selectedItem:string | null, setSelectedItem:Dispatch<SetStateAction<string | null>>, allItems:string[] }) => {
    
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

    const changeSelection = (item: string) => {
        setSelectedItem(item);
        setIsComponentVisible(false);
    }

    return (
        <div className="min-w-[134px] w-fit relative text-white bg-black">
            <div ref={ref}>
                <div className="py-2 px-2 flex items-center text-[15px] md:hover:cursor-pointer border border-emerald-100 w-full rounded-t-sm" onClick={() => setIsComponentVisible(!isComponentVisible)}>
                    <div className="flex justify-between items-center px-1 w-full space-x-2">
                        {selectedItem === null ?
                            <div className="text-gray-200">{thisItem}</div>
                        :
                            <div>{selectedItem}</div>                   
                        }

                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128 192l128 128 128-128z"></path></svg>
                    
                    </div>
                </div>
                
                <div className={`absolute z-[2] w-full border-b border-x border-emerald-100 shadow-lg shadow-gray-800 bg-black ${isComponentVisible ? "visible" : "invisible h-0"}`}>
                    
                    <div className="relative">
                        <div className="min-h-fit max-h-[300px] overflow-y-auto pb-[1px]">                                
                            {allItems.map((item:string) => 
                                <div key={item} onClick={() => changeSelection(item)} className={`my-[-1px] text-[13px] h-[30px] px-2.5 py-1 w-full ${selectedItem !== item && "md:hover:bg-gray-400"} md:hover:cursor-pointer ${selectedItem === item && "bg-gray-800"}`}>{item}</div>
                            )}
                        </div>
                    </div>
                </div>            
                
            </div>
            
        </div>

    )
}

export default Selection;