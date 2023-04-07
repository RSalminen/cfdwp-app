import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'
import { fileService } from '../services/fileService';
import ButtonDark from '../components/buttonDark';
import SmallButtonDarkLink from '../components/smallButtonDarkLink';
import TeacherTopBar from '../components/teacherTopBar';
import TeacherNav from '../components/teacherNav';
import { validateHelper } from '../helpers/validate';
import LoginFallback from '../components/loginFallback';
import LoadingSpinner from '../components/loadingSpinner';
import useComponentVisible from '../hooks/useComponentIsVisible';
import ButtonDarkSmall from '../components/buttonDarkSmall';
import useMyStore from '../store/store';

interface ITeacherSimObj {
    id:string,
    simtitle: string,
    added_date: string,
}

const SimulationActionsCard = ({simObj, teacherid}:{simObj:ITeacherSimObj, teacherid:string}) => (
    <div className="absolute border shadow-md translate-x-[-65px] px-3 py-2 bg-white rounded-sm">
        <div className="flex flex-col space-y-1">
            <SmallButtonDarkLink btnText="View" url={`/view/${simObj.id}/`} fullWidth={true} />
            <SmallButtonDarkLink btnText="Edit" url={`/view/${simObj.id}/${teacherid}`} fullWidth={true} />
            <ButtonDarkSmall btnText="Add to collection" onClickFn={() => {}} fullWidth={true} />
            <ButtonDarkSmall btnText="Delete" onClickFn={() => {}} fullWidth={true} />
        </div>
    </div>
)

const SimulationsRow = ({simObj, teacherid, idx}:{simObj:ITeacherSimObj, teacherid:string, idx:number}) => {

    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

    const addedDate = new Date(simObj.added_date);

    return(
        <tr key={simObj.id} className={`${idx%2 === 0 && " bg-gradient-to-r from-emerald-50 to-gray-100"}`}>
            <td className="py-1 px-1 font-medium min-w-[100px]">{simObj.simtitle}</td>
            <td className="py-1 px-1">vtkjs</td>
            <td className="py-1 px-1">{addedDate.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
            <td className="py-1 px-1">None</td>
            <td className="py-1 px-1 w-[0px]">
                <div ref={ref} className="">
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

    const [activeSims, setActiveSims] = useState<ITeacherSimObj[]>([]);
    const allSims = useRef<ITeacherSimObj[]>([]);

    const simsPerPage = 20;
    const [activePage, setActivePage] = useState<number>(1);
    
    const [loaded, setLoaded] = useState<boolean>(false);

    const ranStart = useRef<boolean>(false);
    const navigate = useNavigate();

    const { teacherid } = useParams();

    const { authHasFailed, reLoginSuccess } = useMyStore();
    
    const loadSimulations = async () => {
 
        const teacherData : ITeacherSimObj[] = await fileService.getSimulationsByTeacher(teacherid!);
        if (!teacherData) return;

        if (teacherData.length >= simsPerPage) setActiveSims(teacherData.slice(0,simsPerPage));
        else setActiveSims(teacherData);

        allSims.current = teacherData;
        setLoaded(true);
    }

    useEffect(() => {
        if (!ranStart.current) {
            validateHelper.checkToken();
            loadSimulations();
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

    useEffect(() => {
        if (allSims.current.length > 0) {
            setActiveSims(allSims.current.slice((activePage-1) * simsPerPage, activePage * simsPerPage));
        }
    }, [activePage])

    //Loading view and login fallback
    if (!loaded || authHasFailed) return (
        <>
            <div className="flex flex-col w-full h-full">
                <TeacherTopBar teacherid={teacherid!} />
                <TeacherNav currentPage={0} teacherid={teacherid!} />

                <div className="flex-grow flex justify-center items-center">
                    <div className="w-12 h-12">
                        {!authHasFailed && <LoadingSpinner />}
                    </div>
                </div>
            </div>
            {/* Handle login fail */}
            {authHasFailed &&
                <LoginFallback onLoginSuccess={() => onLoginSuccess()} />
            }
        </>
    );

    //basic page after load
    return (
        <>  
            <div className="w-full h-full overflow-y-auto">
                <div className="flex flex-col">
                    
                    <TeacherTopBar teacherid={teacherid!} />
                    <TeacherNav currentPage={0} teacherid={teacherid!} />
                    
                    {!authHasFailed && <div className="w-full h-full overflow-x-auto overflow-y-hidden">
                        <div className="flex flex-col items-center mt-4 flex-grow w-[95%] md:w-[85%] mx-auto">
                            <h3 className="mb-2 font-[600] text-[17px]">My simulations</h3>
                            {activeSims.length === 0 ?
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
                                                {activeSims.map((simObj:ITeacherSimObj, idx:number) => (
                                                    <SimulationsRow key={simObj.simtitle} simObj={simObj} teacherid={teacherid!} idx={idx} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {allSims.current.length > 20 && <div className="flex space-x-2 mt-3 pl-1 md:pl-4">
                                    {Array.from(Array(Math.ceil(allSims.current.length / simsPerPage)), (e,i) => (
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