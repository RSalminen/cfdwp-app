import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'
import { fileService } from '../services/fileService';
import ButtonDark from '../components/buttonDark';
import SmallButtonDarkLink from '../components/smallButtonDarkLink';
import { userService } from '../services/userService';
import TeacherTopBar from '../components/teacherTopBar';
import TeacherNav from '../components/teacherNav';
import { validateHelper } from '../helpers/validate';
import LoginFallback from '../components/loginFallback';
import { AxiosError } from 'axios';
import LoadingSpinner from '../components/loadingSpinner';

interface ITeacherSimObj {
    id:string,
    simtitle: string,
    added_date: string,
}

const TeacherHome = () => {

    const [activeSims, setActiveSims] = useState<ITeacherSimObj[]>([]);
    const allSims = useRef<ITeacherSimObj[]>([]);

    const [activePage, setActivePage] = useState<number>(1);
    
    const [loaded, setLoaded] = useState<boolean>(false);
    const [loginFailed, setLoginFailed] = useState<boolean>(false);

    const ranStart = useRef<boolean>(false);
    const navigate = useNavigate();

    const { teacherid } = useParams();
    
    let teacherData : ITeacherSimObj[];

    const loadSimulations = async () => {
        try {
            teacherData = await fileService.getSimulationsByTeacher(teacherid!);
        } catch (e:any) {
            const err = e as AxiosError;
            if (err.response?.status === 401) {
                setLoginFailed(true);
                setLoaded(true);
            }
        }

        if (teacherData.length > 10) setActiveSims(teacherData.slice(0,12));
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
        setLoginFailed(false);
        const tokenId = validateHelper.getTokenId();
        if (tokenId === teacherid) {
            loadSimulations();
        }
        else {
            navigate(`/teacher/${tokenId}`);
        }
    }

    useEffect(() => {
        setActiveSims(allSims.current.slice((activePage-1) * 12, activePage * 12));
    }, [activePage])

    if (!loaded) return (
        <div className="flex flex-col w-full h-full">
            <TeacherTopBar teacherid={teacherid!} />
            <TeacherNav currentPage={0} teacherid={teacherid!} />

            <div className="flex-grow flex justify-center items-center">
                <div className="w-12 h-12">
                    <LoadingSpinner />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {loginFailed &&
            <LoginFallback onLoginSuccess={() => onLoginSuccess} />
            }

            <div className="flex flex-col">
                
                <TeacherTopBar teacherid={teacherid!} />
                <TeacherNav currentPage={0} teacherid={teacherid!} />

                <div className="flex flex-col items-center mt-4 flex-grow w-[95%] md:w-[80%] mx-auto">
                    <h3 className="mb-2 font-[600] text-[17px]">My simulations</h3>
                    {activeSims.length === 0 ?
                    <div className="flex flex-col justify-evenly h-1/2">
                        <p>You haven't posted any simulations yet</p>
                        <ButtonDark btnText="Lets go add a simulation!" fullWidth={true} onClickFn={() => {navigate(`/teacher/${teacherid}/addfile`)}} />
                    </div>
                    :

                    <div className="flex-1 h-0 w-full xl:flex-none xl:h-fit rounded-sm pb-2">
                        
                        <div className="text-[13px] sm:text-[15px] px-1 md:px-4 py-2">
                            <table className="w-full table-fixed text-center min-w-[300px]">
                                <thead>
                                    <tr>
                                        <th className="py-[4px]">Name</th>
                                        <th className="py-[4px]">Filetype</th>
                                        <th className="py-[4px]">Date added</th>
                                        <th className="py-[4px]">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="border border-gray-300">
                                    {activeSims.map((simObj:ITeacherSimObj, idx:number) =>
                                        <tr key={simObj.id} className={`${idx%2 === 0 && " bg-gradient-to-r from-emerald-50 to-gray-100"}`}>
                                            <td className="py-[4px] font-medium">{simObj.simtitle}</td>
                                            <td className="py-[4px]">vtkjs</td>
                                            <td className="py-[4px]">{simObj.added_date}</td>
                                            <td className="py-[4px]">
                                                <div className="flex space-x-1 justify-center">
                                                    <SmallButtonDarkLink btnText="View" url={`/view/${simObj.id}/`} />
                                                    <SmallButtonDarkLink btnText="Edit" url={`/view/${simObj.id}/${teacherid}`} />
                                                </div>
                                            </td>
                                        </tr>
                                        
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex space-x-2 mt-3 pl-1 md:pl-4">
                            {Array.from(Array(Math.ceil(allSims.current.length / 12)), (e,i) => (
                                activePage === (i+1) 
                                ? <div key={i} className="border-b border-emerald-600 h-[21px] flex items-center">{i + 1}</div>
                                : <div key={i} onClick={() => setActivePage(i+1)} className="hover:cursor-pointer text-gray-700 h-[20px] flex items-center">{i+1}</div>
                            ))}
                        </div>
                    </div>
                    }
                    
                </div>
            </div>
        </>
    );
}

export default TeacherHome;