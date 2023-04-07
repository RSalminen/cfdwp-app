import { useParams } from "react-router-dom";
import TeacherNav from "../components/teacherNav";
import TeacherTopBar from "../components/teacherTopBar";
import useMyStore from "../store/store";
import LoginFallback from "../components/loginFallback";

const MyCollections = () => {

    const {teacherid} = useParams();

    const { authHasFailed } = useMyStore();
    return (
        <>  
            {authHasFailed &&
            <LoginFallback onLoginSuccess={() => {}} />
            }
            
            <div className="w-full h-full">
                <TeacherTopBar teacherid={teacherid!} />
                <TeacherNav currentPage={1} teacherid={teacherid!} />

            </div>
        </>
    )

}

export default MyCollections;