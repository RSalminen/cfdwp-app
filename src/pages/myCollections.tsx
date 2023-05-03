import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'
import ButtonDark from '../components/uiComponents/buttonDark';
import TeacherTopBar from '../components/teacherTopBar';
import TeacherNav from '../components/teacherNav';
import { validateHelper } from '../helpers/validateHelper';
import LoginFallback from '../components/loginFallback';
import LoadingSpinner from '../components/uiComponents/loadingSpinner';
import useComponentVisible from '../hooks/useComponentIsVisible';
import ButtonDarkSmall from '../components/uiComponents/buttonDarkSmall';
import useMyStore from '../store/store';
import { collectionService } from '../services/collectionService';
import MessageBox from '../components/messageBox';
import { ITeacherCollObj } from '../types';
import ConfirmCard from '../components/confirmCard';
import WhiteOverlay from '../components/uiComponents/whiteOverlay';

const CollectionCard = () => {


    return (
        <WhiteOverlay>

        </WhiteOverlay>
    );
}


const CollectionActionsCard = ({collObj, teacherid}:{collObj:ITeacherCollObj, teacherid:string}) => {

    const [confirmDeleteActive, setConfirmDeleteActive] = useState<boolean>(false);

    const { updateMessage } = useMyStore();

    const deleteCollection = async () => {
        updateMessage({ status:1, message: `Deleting simulation ${collObj.name}`});
        setConfirmDeleteActive(false);
        
        const response = await collectionService.deleteCollection(collObj.id, teacherid);

        if (response) {
            updateMessage({ status:2, message: `${collObj.name} deleted`});
        }

        else updateMessage({ status:3, message: `Deleting simulation ${collObj.name} failed`});
    }

    return (
        <>
        {confirmDeleteActive && 
            <ConfirmCard message="Are you sure you want to delete simulation" itemName={collObj.name} onConfirm={deleteCollection} onCancel={() => setConfirmDeleteActive(false)} />
        }
        <div className="absolute border shadow-md translate-x-[-65px] px-3 py-2 bg-white rounded-sm">
            <div className="flex flex-col space-y-1">
                <ButtonDarkSmall btnText="Delete" onClickFn={() => setConfirmDeleteActive(true)} fullWidth={true} />
            </div>
        </div>
        </>
    )
}

const CollectionsRow = ({collObj, teacherid, idx}:{collObj:ITeacherCollObj, teacherid:string, idx:number}) => {

    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

    const addedDate = new Date(collObj.date_added);

    return(
        <tr key={collObj.name + collObj.date_added} className={`${idx%2 === 0 && " bg-gradient-to-r from-emerald-50 to-gray-100"}`}>
            <td className="py-1 px-1 font-medium min-w-[100px] max-w-[150px]">{collObj.name}</td>
            <td className="py-1 px-1">{addedDate.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
            <td className="py-1 px-1 w-[0px]">
                <div ref={ref} className="">
                    <svg className={`${isComponentVisible && "stroke-emerald-600"} cursor-pointer`} onClick={() => setIsComponentVisible(!isComponentVisible)} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    {isComponentVisible && 
                    <CollectionActionsCard collObj={collObj} teacherid={teacherid} />
                    }
                </div>
            </td>
        </tr>
    );

}


const MyCollections = () => {

    const collsPerPage = 20;
    const [activePage, setActivePage] = useState<number>(1);
    
    const [loaded, setLoaded] = useState<boolean>(false);

    const ranStart = useRef<boolean>(false);
    const navigate = useNavigate();

    const { teacherid } = useParams();

    const { authHasFailed, reLoginSuccess, message, collectionsByTeacher } = useMyStore();
    
    const loadCollections = async () => {
 
        const response = await collectionService.getCollectionsByTeacher(teacherid!)
        if (!response) return;

        setLoaded(true);
    }

    useEffect(() => {
        if (!ranStart.current) {
            validateHelper.checkToken();
            if (collectionsByTeacher === null) loadCollections();
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
            loadCollections();
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
                <TeacherNav currentPage={1} teacherid={teacherid!} />

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

                {/* Display the page */}
                <div className="flex flex-col h-full">
                    
                    <TeacherTopBar teacherid={teacherid!} />
                    <TeacherNav currentPage={1} teacherid={teacherid!} />
                    
                    <div className="w-full h-full overflow-x-auto">

                        <div className="flex flex-col items-center mt-4 flex-grow w-[95%] md:w-[85%] mx-auto">
                            <h3 className="mb-2 font-[600] text-[17px]">My Collections</h3>
                            {collectionsByTeacher !== null && collectionsByTeacher.length === 0 ?
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
                                                    <th className="py-1 px-1">Date added</th>
                                                </tr>
                                            </thead>

                                            <tbody className="border border-gray-300">
                                                {collectionsByTeacher !== null && collectionsByTeacher.slice(collsPerPage*(activePage-1), collsPerPage*activePage).map((collObj:ITeacherCollObj, idx:number) => (
                                                    <CollectionsRow key={collObj.id} collObj={collObj} teacherid={teacherid!} idx={idx} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {collectionsByTeacher !== null && collectionsByTeacher.length > 20 && <div className="flex space-x-2 mt-3 pl-1 md:pl-4">
                                    {Array.from(Array(Math.ceil(collectionsByTeacher.length / collsPerPage)), (e,i) => (
                                        activePage === (i+1) 
                                        ? <div key={i} className="border-b border-emerald-600 h-[21px] flex items-center">{i + 1}</div>
                                        : <div key={i} onClick={() => setActivePage(i+1)} className="cursor-pointer text-gray-700 h-[20px] flex items-center">{i+1}</div>
                                    ))}
                                </div>}
                            </div>
                            }
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MyCollections;