import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'
import { fileService } from '../services/fileService';
import ButtonDark from '../components/buttonDark';
import SmallButtonDarkLink from '../components/smallButtonDarkLink';
import { userService } from '../services/userService';

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
    const ranStart = useRef<boolean>(false);

    const navigate = useNavigate();

    const { teacherid } = useParams();
    

    const loadSimulations = async () => {
        
        const loggedUserJSON = window.localStorage.getItem('loggedCFDWPUser');
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON);
            userService.setToken(user.token);
        }

        const teacherData = await fileService.getSimulationsByTeacher(teacherid!);
        
        if (teacherData.length > 10) setActiveSims(teacherData.slice(0,12));
        else setActiveSims(teacherData);

        allSims.current = teacherData;
        setLoaded(true);
    }

    useEffect(() => {
        if (!ranStart.current) loadSimulations();

        return () => {ranStart.current = true}
    }, []);

    useEffect(() => {
        setActiveSims(allSims.current.slice((activePage-1) * 12, activePage * 12));
    }, [activePage])

    if (!loaded) return null;

    return (
        <div className="flex flex-col overflow-x-hidden">
            <div className="h-[60px] flex items-center bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
                <div className="flex justify-between w-[80%] m-auto items-center">
                    <h1 className='text-[30px] font-bold font-serif w-[70%]'>CFDWebProject</h1>
                </div>
            </div>

            <div className="w-full h-10 flex justify-center bg-gray-50 border-b border-emerald-800">
                <div className="w-[80%] h-full flex space-x-10 items-center text-[14px] font-semibold">
                    <h5 className="border-b-2 border-emerald-900">Home</h5>
                    <Link to={`/teacher/${teacherid}/addfile`}>Post simulation</Link>
                </div>
            </div>

            <div className="flex flex-col items-center mt-4 h-[calc(100vh-120px)] w-[95%] md:w-[80%] mx-auto">
                <h3 className="mb-2 font-[500] text-[17px]">My simulations:</h3>
                {activeSims.length === 0 ?
                <div className="flex flex-col justify-evenly h-1/2">
                    <p>You haven't posted any simulations yet</p>
                    <ButtonDark btnText="Lets go add a simulation!" fullWidth={true} onClickFn={() => {navigate(`/teacher/${teacherid}/addfile`)}} />
                </div>
                :

                <div className="flex-1 h-0 w-full xl:flex-none xl:h-fit rounded-sm pb-2">
                    
                    <div className="text-[13px] sm:text-[15px] px-1 md:px-4 py-2 xl:border xl:border-emerald-100 xl:shadow-md xl:shadow-emerald-100">
                        <table className="w-full table-fixed text-center min-w-[300px]">
                            <thead>
                                <tr>
                                    <th className="border-b border-emerald-600 py-[4px]">Name</th>
                                    <th className="border-b border-emerald-600 py-[4px]">Filetype</th>
                                    <th className="border-b border-emerald-600 py-[4px]">Date added</th>
                                    <th className="border-b border-emerald-600 py-[4px]">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {activeSims.map((simObj:ITeacherSimObj) =>
                                    <tr className="border-b">
                                        <td className="border-b border-emerald-600 py-[4px] font-medium">{simObj.simtitle}</td>
                                        <td className="border-b border-emerald-600 py-[4px]">vtkjs</td>
                                        <td className="border-b border-emerald-600 py-[4px]">{simObj.added_date}</td>
                                        <td className="border-b border-emerald-600 py-[4px]">
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
                            ? <div className="border-b border-emerald-600 h-[21px] flex items-center">{i + 1}</div>
                            : <div onClick={() => setActivePage(i+1)} className="hover:cursor-pointer text-gray-700 h-[20px] flex items-center">{i+1}</div>
                        ))}
                    </div>
                </div>
                }
                
            </div>
        </div>
    );
}

export default TeacherHome;