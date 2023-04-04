import { useParams } from "react-router-dom";
import TeacherTopBar from "../components/teacherTopBar";
import TeacherNav from "../components/teacherNav";

const AddCollection = () => {

    const {teacherid} = useParams();
    return (
        <div className="w-full h-full">
            <TeacherTopBar teacherid={teacherid!} />
            <TeacherNav currentPage={3} teacherid={teacherid!} />
        </div>
    );
}

export default AddCollection;