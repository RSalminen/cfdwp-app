import { useParams } from "react-router-dom";
import TeacherTopBar from "./teacherTopBar";
import TeacherNav from "./teacherNav";
import CustomInput from "./customInput";
import { useState } from "react";
import ButtonDark from "./buttonDark";

const AddCollection = () => {

    const {teacherid} = useParams();
    const [collectionTitle, setCollectionTitle] = useState<string>("")

    return (
        <div className="w-full h-full">
            <div className="flex flex-col h-full">
                <TeacherTopBar teacherid={teacherid!} />
                <TeacherNav currentPage={3} teacherid={teacherid!} />
                <div className="flex-grow pt-12 pb-4 flex justify-center">
                    <div className="w-[220px] flex flex-col items-center space-y-3 h-fit">
                        <h3 className="font-semibold">Add a collection</h3>
                        <CustomInput currentValue={collectionTitle} labelText="Name" onChange={(e:any) => setCollectionTitle(e.target.value)} />
                        <ButtonDark btnText="Submit" fullWidth={true} onClickFn={() => {}} />
                    </div>
                </div>
            </div>
        </div>
        
    );
}

export default AddCollection;