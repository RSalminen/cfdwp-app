import { useParams } from "react-router-dom";
import TeacherNav from "../components/teacherNav";
import TeacherTopBar from "../components/teacherTopBar";

const MyCollections = () => {

    const {teacherid} = useParams();
    return (
        <div className="w-full h-full">
            <TeacherTopBar teacherid={teacherid!} />
            <TeacherNav currentPage={1} teacherid={teacherid!} />
        </div>
    )

}

export default MyCollections;