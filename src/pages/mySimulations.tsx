import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'
import { fileService } from '../services/fileService';
import ButtonDark from '../components/uiComponents/buttonDark';
import SmallButtonDarkLink from '../components/uiComponents/smallButtonDarkLink';
import TeacherTopBar from '../components/teacherTopBar';
import TeacherNav from '../components/teacherNav';
import { validateHelper } from '../helpers/validateHelper';
import LoginFallback from '../components/loginFallback';
import LoadingSpinner from '../components/uiComponents/loadingSpinner';
import useComponentVisible from '../hooks/useComponentIsVisible';
import ButtonDarkSmall from '../components/uiComponents/buttonDarkSmall';
import useMyStore from '../store/store';
import ConfirmCard from '../components/confirmCard';
import { ITeacherCollObj, ITeacherSimObj } from '../types';
import { collectionService } from '../services/collectionService';
import ButtonCancel from '../components/uiComponents/buttonCancel';
import MessageBox from '../components/messageBox';
import WhiteOverlay from '../components/uiComponents/whiteOverlay';

const Ifiletype : { [key:number] : string } = {
    1: "vtp",
    2: "vti",
    3: "vtkjs"
}

const SimulationCard = ({simObj, onClose, teacherid} : {simObj:ITeacherSimObj, onClose:Function, teacherid:string}) => {

    const addedDate = new Date(simObj.added_date);

    const [confirmDeleteActive, setConfirmDeleteActive] = useState<boolean>(false);
    const [addToCollectionActive, setAddToCollectionActive] = useState<boolean>(false);

    const { updateMessage } = useMyStore();
   
    const deleteSimulation = async () => {

        updateMessage({ status:1, message: `Deleting simulation ${simObj.simtitle}`});
        setConfirmDeleteActive(false);

        const response = await fileService.deleteSimulation(simObj.id, teacherid);

        if (response) {
            updateMessage({ status:2, message: `Simulation ${simObj.simtitle} was deleted`});
        }

        else updateMessage({ status:3, message: `Deleting simulation ${simObj.simtitle} failed`});
    }

    return (
        <WhiteOverlay onClickOutside={() => onClose()} >

            {confirmDeleteActive && 
                <div onClick={e => e.stopPropagation()}>
                    <ConfirmCard message="Are you sure you want to delete simulation" itemName={simObj.simtitle} onConfirm={deleteSimulation} onCancel={() => setConfirmDeleteActive(false)} />
                </div>
            }

            {addToCollectionActive &&
                <div onClick={e => e.stopPropagation()}>
                    <AddToCollectionCard simObj={simObj} teacherid={teacherid} onCancel={() => setAddToCollectionActive(false)} onSuccess={() => setAddToCollectionActive(false)} />
                </div>
            }

            <div onClick={e => e.stopPropagation()} className="bg-white px-6 py-3 border rounded-md shadow-lg max-w[90%] sm:max-w-[70%] md:max-w-[60%] relative">
                
                <svg onClick={() => onClose()} className="cursor-pointer absolute right-2 top-2 h-4 w-4" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
                
                <h3 className='pb-2 pl-2 text-[20px] font-medium'>Simulation</h3>
                <div className="flex flex-wrap justify-around w-full overflow-hidden">
                    <div className="flex flex-col pb-2 px-2 max-w-[50%]">
                        <h5 className="text-sm text-center">Name</h5>
                        <p className="font-medium two-lines">{simObj.simtitle}</p>
                    </div>

                    <div className="flex flex-col pb-2 px-2 max-w-[50%]">
                        <h5 className="text-sm text-center">Added</h5>
                        <p className="font-medium two-lines">{addedDate.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                </div>

                <div className="flex space-x-2 w-full pt-2">
                    <SmallButtonDarkLink btnText="View" url={simObj.filetype !== 2  ? `/view/${simObj.id}/` : `/viewvti/${simObj.id}/`} fullWidth={true} />
                    <SmallButtonDarkLink btnText="Edit" url={simObj.filetype !== 2  ? `/view/${simObj.id}/${teacherid}` : `/viewvti/${simObj.id}/${teacherid}`} fullWidth={true} />
                    <ButtonDarkSmall btnText="Add to collection" onClickFn={() => setAddToCollectionActive(true)} fullWidth={true} />
                    <ButtonDarkSmall btnText="Delete" onClickFn={() => setConfirmDeleteActive(true)} fullWidth={true} />
                </div>
            </div>
        </WhiteOverlay>
    );
}


const AddToCollectionCard = ({simObj, teacherid, onCancel, onSuccess} : {simObj:ITeacherSimObj, teacherid:string, onCancel:Function, onSuccess:Function}) => {

    const startEffectRun = useRef<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const [selected, setSelected] = useState<ITeacherCollObj | null>(null);
    const { updateMessage, collectionsByTeacher } = useMyStore();

    const sendUpdate = async () => {
        updateMessage({ status:1, message: `Adding ${simObj.simtitle} to the collection ${selected!.name}`});
        const response = await fileService.setToCollection(simObj.id, teacherid, selected!.id);

        if (response) {
            updateMessage({ status:2, message: `${simObj.simtitle} added to the collection ${selected!.name}`});
            onSuccess();
        }
        else updateMessage({ status:3, message: `Adding ${simObj.simtitle} to the collection ${selected!.name} failed`})
    }

    const loadCollections = async () => {
        const response = await collectionService.getCollectionsByTeacher(teacherid);
        setLoading(false);
    }

    useEffect(() => {
        if (!startEffectRun.current) {
            if (collectionsByTeacher === null) loadCollections();
            else setLoading(false);
        }

        return () => {startEffectRun.current = true}
    }, []);

    const checkExisting = (coll:ITeacherCollObj) => coll.file_ids.includes(parseInt(simObj.id));

    return (
        <div className="w-full h-full fixed top-0 left-0 z-[20] bg-white border bg-opacity-90 flex justify-center items-center">
            <div className="flex flex-col border shadow-lg bg-white px-6 py-8 max-h-[80%] rounded-md max-w-[95%] sm:max-w-[80%]">
                <div className="flex justify-center space-x-1 text-[17px] mb-2">
                    <h3>Add <span className="font-semibold">{simObj.simtitle}</span> to collection</h3>
                </div>

                <div>Select collection:</div>
                {loading ?
                <div className="flex w-full justify-center">
                    <div className="h-12 w-12">
                        <LoadingSpinner />
                    </div>
                </div>
                :
                <>
                <div className="flex flex-col max-h-[90%] overflow-y-auto border rounded-sm px-2 py-1 mb-2">
                    {collectionsByTeacher !== null && collectionsByTeacher.map((coll, idx) => (
                        <div onClick={() => !checkExisting(coll) && setSelected(coll)} className={`${checkExisting(coll) ? "bg-red-300 cursor-not-allowed" : idx%2 === 0 && "bg-gradient-to-r from-emerald-50 to-gray-100"} px-1 cursor-pointer`} key={coll.id}>
                            {coll.name}
                        </div>
                    ))}
                </div>
                
                {selected &&
                    <div>Selected: <span className="font-semibold">{selected.name}</span></div>
                }
                </>
                }

                <div className="mt-4 px-3 flex max-w-[400px] space-x-3">
                    <ButtonDark btnText="Confirm" onClickFn={sendUpdate} fullWidth={true} />
                    <ButtonCancel btnText="Cancel" onClickFn={onCancel} fullWidth={true} />
                </div>
            </div>
        </div>
    )
}

const SimulationActionsCard = ({simObj, teacherid}:{simObj:ITeacherSimObj, teacherid:string}) => {
    
    const [confirmDeleteActive, setConfirmDeleteActive] = useState<boolean>(false);
    const [addToCollectionActive, setAddToCollectionActive] = useState<boolean>(false);

    const { updateMessage } = useMyStore();
   
    const deleteSimulation = async () => {

        updateMessage({ status:1, message: `Deleting simulation ${simObj.simtitle}`});
        setConfirmDeleteActive(false);

        const response = await fileService.deleteSimulation(simObj.id, teacherid);

        if (response) {
            updateMessage({ status:2, message: `Simulation ${simObj.simtitle} was deleted`});
        }

        else updateMessage({ status:3, message: `Deleting simulation ${simObj.simtitle} failed`});
    }

    return (
    <>
        {confirmDeleteActive && 
            <ConfirmCard message="Are you sure you want to delete simulation" itemName={simObj.simtitle} onConfirm={deleteSimulation} onCancel={() => setConfirmDeleteActive(false)} />
        }

        {addToCollectionActive &&
            <AddToCollectionCard simObj={simObj} teacherid={teacherid} onCancel={() => setAddToCollectionActive(false)} onSuccess={() => setAddToCollectionActive(false)} />
        }
        <div className="absolute z-[2] border shadow-md translate-x-[-65px] px-3 py-2 bg-white rounded-sm">
            <div className="flex flex-col space-y-1">
                <SmallButtonDarkLink btnText="View" url={simObj.filetype !== 2  ? `/view/${simObj.id}/` : `/viewvti/${simObj.id}/`} fullWidth={true} />
                <SmallButtonDarkLink btnText="Edit" url={simObj.filetype !== 2  ? `/view/${simObj.id}/${teacherid}` : `/viewvti/${simObj.id}/${teacherid}`} fullWidth={true} />
                <ButtonDarkSmall btnText="Add to collection" onClickFn={() => setAddToCollectionActive(true)} fullWidth={true} />
                <ButtonDarkSmall btnText="Delete" onClickFn={() => setConfirmDeleteActive(true)} fullWidth={true} />
            </div>
        </div>
    </>
    )
}

const SimulationsRow = ({simObj, teacherid, idx, onClickFn}:{simObj:ITeacherSimObj, teacherid:string, idx:number, onClickFn:Function}) => {

    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

    const addedDate = new Date(simObj.added_date);

    return(
        <tr key={simObj.id}
         className={`${idx%2 === 0 ? "bg-gradient-to-r from-emerald-50 to-gray-100 hover:from-gray-100 hover:to-emerald-50" : "bg-white hover:bg-gradient-to-r hover:from-white hover:to-emerald-50"} cursor-pointer`}>
            <td onClick={() => onClickFn()} className="py-1 px-1 font-medium min-w-[100px]">{simObj.simtitle}</td>
            <td onClick={() => onClickFn()} className="py-1 px-1">{Ifiletype[simObj.filetype]}</td>
            <td onClick={() => onClickFn()} className="py-1 px-1">{addedDate.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
            <td onClick={() => onClickFn()} className="py-1 px-1">{"None"}</td>
            <td className="py-1 px-1 w-[0px]">
                <div ref={ref} className="relative">
                    <svg className={`${isComponentVisible && "stroke-emerald-600"} cursor-pointer`} onClick={() => setIsComponentVisible(!isComponentVisible)} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    {isComponentVisible && 
                    <SimulationActionsCard simObj={simObj} teacherid={teacherid} />
                    }
                </div>
            </td>
        </tr>
    );

}


const MySimulations = () => {

    const simsPerPage = 20;

    const [activePage, setActivePage] = useState<number>(1);
    
    const [loaded, setLoaded] = useState<boolean>(false);

    const [activeRow, setActiveRow] = useState<ITeacherSimObj | null>(null);

    const ranStart = useRef<boolean>(false);
    const navigate = useNavigate();

    const { teacherid } = useParams();

    const { authHasFailed, reLoginSuccess, message, simulationsByTeacher } = useMyStore();
    
    const loadSimulations = async () => {
 
        const response = await fileService.getSimulationsByTeacher(teacherid!);
        if (!response) return;
        
        setLoaded(true);
    }

    useEffect(() => {
        if (!ranStart.current) {
            validateHelper.checkToken();
            if (simulationsByTeacher === null) loadSimulations();
            else setLoaded(true);
        }
        return () => {ranStart.current = true}
    }, []);

    const onLoginSuccess = () => {
        //update store isLoggedIn
        reLoginSuccess();

        const tokenId = validateHelper.getTokenId();
        //Try loading the simulations if the teacherId of the logged in user matches the address, otherwise relocate
        if (tokenId.toString() === teacherid) {
            loadSimulations();
        }
        else {
            navigate(`/teacher/${tokenId}`);
        }
    }

    //Loading view and login fallback
    if (!loaded || authHasFailed) return (
        <>
            {/* Handle login fail */}
            {authHasFailed &&
                <LoginFallback onLoginSuccess={() => onLoginSuccess()} />
            }
            <div className="flex flex-col w-full h-full">
                <TeacherTopBar teacherid={teacherid!} />
                <TeacherNav currentPage={0} teacherid={teacherid!} />

                <div className="flex-grow flex justify-center items-center">
                    <div className="w-12 h-12">
                        {!authHasFailed && <LoadingSpinner />}
                    </div>
                </div>
            </div>
        </>
    );

    //basic page after load
    return (
        <>  

            <div className="w-full h-full overflow-y-auto">

                {/* Display message */}
                {message.status !== 0 &&
                    <MessageBox />
                }

                {/* Display a simulation card */}
                {activeRow && 
                    <SimulationCard simObj={activeRow} onClose={() => setActiveRow(null)} teacherid={teacherid!} />
                }

                {/* Display the page */}
                <div className="flex flex-col h-full">
                    
                    <TeacherTopBar teacherid={teacherid!} />
                    <TeacherNav currentPage={0} teacherid={teacherid!} />
                    
                    {!authHasFailed && 
                    <div className="w-full h-full overflow-x-auto">
                        <div className="flex flex-col items-center mt-4 flex-grow w-[95%] md:w-[85%] mx-auto">
                            <h3 className="mb-2 font-semibold text-[17px] text-center">My Simulations</h3>
                            {simulationsByTeacher!==null && simulationsByTeacher.length === 0 ?
                            <div className="flex flex-col justify-evenly h-1/2">
                                <p>You haven't posted any simulations yet</p>
                                <ButtonDark btnText="Lets go add a simulation!" fullWidth={true} onClickFn={() => {navigate(`/teacher/${teacherid}/addfile`)}} />
                            </div>
                            :

                            <div className="flex-1 h-0 w-full xl:flex-none xl:h-fit rounded-sm pb-2">
                                
                                <div className="text-[13px] sm:text-[15px] px-1 md:px-4 py-2">
                                    <div className="w-full flex">
                                        <table className="w-full table-auto text-center">
                                            <thead>
                                                <tr>
                                                    <th className="py-1 px-1">Name</th>
                                                    <th className="py-1 px-1">Filetype</th>
                                                    <th className="py-1 px-1">Date added</th>
                                                    <th className="py-1 px-1">Collection</th>
                                                </tr>
                                            </thead>

                                            <tbody className="border border-gray-300">
                                                {simulationsByTeacher !== null && simulationsByTeacher.slice(simsPerPage*(activePage-1), simsPerPage*activePage).map((simObj:ITeacherSimObj, idx:number) => (
                                                    <SimulationsRow key={simObj.id} simObj={simObj} teacherid={teacherid!} idx={idx} onClickFn={() => setActiveRow(simObj)} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {simulationsByTeacher !== null && simulationsByTeacher.length > 20 && <div className="flex space-x-2 mt-3 pl-1 md:pl-4">
                                    {Array.from(Array(Math.ceil(simulationsByTeacher.length / simsPerPage)), (e,i) => (
                                        activePage === (i+1) 
                                        ? <div key={i} className="border-b border-emerald-600 h-[21px] flex items-center">{i + 1}</div>
                                        : <div key={i} onClick={() => setActivePage(i+1)} className="cursor-pointer text-gray-700 h-[20px] flex items-center">{i+1}</div>
                                    ))}
                                </div>}
                            </div>
                            }
                            
                        </div>
                    </div>
                    }
                </div>
            </div>
        </>
    );
}

export default MySimulations;