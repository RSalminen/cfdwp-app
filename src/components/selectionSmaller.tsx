import { Dispatch, SetStateAction } from "react";
import useComponentVisible from "../hooks/useComponentIsVisible";

const SelectionSmaller = ({selectedItem, onChangeFn, thisItem, allItems, light, fullWidth=false}: {thisItem:string | null, selectedItem:string | null, onChangeFn:Function, allItems:string[], light?:boolean, fullWidth?:boolean }) => {
    
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

    const changeSelection = (item: string) => {
        onChangeFn(item);
        setIsComponentVisible(false);
    }

    if (light) return (
        <div className={`${fullWidth && "w-full"} relative text-black bg-white`}>
            <div ref={ref}>
                <div className="py-1.5 px-1.5 flex items-center text-[14px] md:cursor-pointer border border-gray-400 w-full rounded-t-sm" onClick={() => setIsComponentVisible(!isComponentVisible)}>
                    <div className="flex justify-between items-center px-1 w-full space-x-2">

                        <div>{selectedItem}</div>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128 192l128 128 128-128z"></path></svg>
                    
                    </div>
                </div>
                
                <div className={`absolute z-[2] w-full border-b border-x border-gray-400 shadow-lg shadow-gray-800 bg-white ${isComponentVisible ? "visible" : "invisible h-0 overflow-y-hidden"}`}>
                    
                    <div className="relative">
                        <div className="min-h-fit max-h-[300px] overflow-y-auto pb-[1px]">                                
                            {allItems.map((item:string) => 
                                <div key={item} onClick={() => changeSelection(item)} className={`my-[-1px] text-[13px] h-[30px] px-2.5 py-1 w-full ${selectedItem !== item && "md:hover:bg-gray-400"} md:cursor-pointer ${selectedItem === item && "bg-gray-200"}`}>{item}</div>
                            )}
                        </div>
                    </div>
                </div>            
                
            </div>
            
        </div>
    )

    else return (
        <div className={`min-w-[120px] sm:min-w-[134px] w-fit ${fullWidth && "w-full"} relative text-white bg-black`}>
            <div ref={ref}>
                <div className="py-1.5 pr-1 pl-2 flex items-center text-[12px] sm:text-[13px] md:cursor-pointer border w-full rounded-t-sm" onClick={() => setIsComponentVisible(!isComponentVisible)}>
                    <div className="flex justify-between items-center w-full">
                        {selectedItem === null ?
                            <div className="text-gray-200">{thisItem}</div>
                        :
                            <div className="max-w-full overflow-hidden text-ellipsis">{selectedItem}</div>
                        }

                        <svg className="h-[14px] w-[14px]" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128 192l128 128 128-128z"></path></svg>
                    
                    </div>
                </div>
                
                <div className={`absolute z-[2] w-full border-b border-x border-emerald-100 shadow-md shadow-gray-800 bg-black ${isComponentVisible ? "visible" : "invisible"}`}>
                    
                    <div className="relative">
                        <div className="min-h-fit max-h-[300px] overflow-y-auto pb-[1px]">                                
                            {allItems.map((item:string) => 
                                <div key={item} onClick={() => changeSelection(item)} className={`my-[-1px] text-[11px] sm:text-[12px] overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-1 w-full ${selectedItem !== item && "md:hover:bg-gray-400"} md:cursor-pointer ${selectedItem === item && "bg-gray-800"}`}>{item}</div>
                            )}
                        </div>
                    </div>
                </div>            
                
            </div>
            
        </div>

    )
}

export default SelectionSmaller;