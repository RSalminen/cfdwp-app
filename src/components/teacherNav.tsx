import { useState } from "react";
import { Link } from "react-router-dom";
import AddFile from "./addFile";
import AddCollection from "./addCollection";
import { fileService } from "../services/fileService";
import useMyStore from "../store/store";

const TeacherNav = ({currentPage, teacherid} : {currentPage:number, teacherid:string}) => {
    const routes = [
        {name: "My Simulations", route: `/teacher/${teacherid}`},
        {name: "My Collections", route: `/teacher/${teacherid}/collections`},
    ]

    const [addSimToggled, setAddSimToggled] = useState<boolean>(false);
    const [createCollToggled, setCreateCollToggled] = useState<boolean>(false);

    const { updateMessage } = useMyStore();
    

    return (
        <div className="w-full py-2 flex justify-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
            <div className="w-[95%] sm:w-[85%] md:w-[80%] flex justify-between">
                <div className="h-full flex space-x-3 sm:space-x-10 items-center text-[12px] sm:text-[14px] font-semibold">
                    {routes.map((route:{name:string, route:string}, idx:number) => (
                        currentPage === idx ?
                        <h5 key={route.name} className="border-b-2 border-emerald-800">{route.name}</h5>
                        : <Link key={route.name} to={route.route}>{route.name}</Link>
                    ))}
                </div>

                <div className="flex flex-col space-y-0.5 text-[12px] sm:text-[14px] font-medium">
                    <div className="hover-translate-child cursor-pointer" onClick={() => setAddSimToggled(true)}>
                        <div className="flex items-center space-x-1">
                            <svg className="w-[19px] h-[19px]" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 1H4a2 2 0 00-2 2v10a2 2 0 002 2h5v-1H4a1 1 0 01-1-1V3a1 1 0 011-1h5v2.5A1.5 1.5 0 0010.5 6H13v2h1V6L9 1z"></path><path fillRule="evenodd" d="M13.5 10a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 010-1H13v-1.5a.5.5 0 01.5-.5z" clipRule="evenodd"></path><path fillRule="evenodd" d="M13 12.5a.5.5 0 01.5-.5h2a.5.5 0 010 1H14v1.5a.5.5 0 01-1 0v-2z" clipRule="evenodd"></path></svg>
                            <p>Add Simulation</p>
                        </div>
                    </div>
                    
                    <div className="hover-translate-child cursor-pointer" onClick={() => setCreateCollToggled(true)}>
                        <div className="ml-[1px] flex items-center space-x-1">
                            <svg className="w-[18px] h-[18px]" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9.828 4H2.19a1 1 0 00-.996 1.09l.637 7a1 1 0 00.995.91H9v1H2.826a2 2 0 01-1.991-1.819l-.637-7a1.99 1.99 0 01.342-1.31L.5 3a2 2 0 012-2h3.672a2 2 0 011.414.586l.828.828A2 2 0 009.828 3h3.982a2 2 0 011.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0013.81 4H9.828zm-2.95-1.707L7.587 3H2.19c-.24 0-.47.042-.684.12L1.5 2.98a1 1 0 011-.98h3.672a1 1 0 01.707.293z" clipRule="evenodd"></path><path fillRule="evenodd" d="M13.5 10a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 010-1H13v-1.5a.5.5 0 01.5-.5z" clipRule="evenodd"></path><path fillRule="evenodd" d="M13 12.5a.5.5 0 01.5-.5h2a.5.5 0 010 1H14v1.5a.5.5 0 01-1 0v-2z" clipRule="evenodd"></path></svg>
                            <p>Create Collection</p>
                        </div>
                    </div>
                </div>
            </div>

            {addSimToggled && 
                <AddFile onReturn={() => setAddSimToggled(false)} onSubmit={() => setAddSimToggled(false)} />
            }
            {createCollToggled &&
                <AddCollection onReturn={() => setCreateCollToggled(false)} onSubmit={() => setCreateCollToggled(false)} />
            }
        </div>
    )
}

export default TeacherNav;