import { MouseEvent, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ButtonDark from "../components/buttonDark";
import { fileService } from "../services/fileService";
import TeacherTopBar from "../components/teacherTopBar";
import TeacherNav from "../components/teacherNav";
import { validateHelper } from "../helpers/validate";
import LoginFallback from "../components/loginFallback";

const AddFilePage = () => {
    const [selectedFile, setSelectedVTPFile] = useState<File>();
    const [simNameInput, setSimNameInput] = useState<string>("");
    const { teacherid } = useParams();

    const [loginFailed, setLoginFailed] = useState<boolean>(false);

    const startEffectRun = useRef<boolean>(false);

    useEffect(() => {
        if (!startEffectRun.current) {
            validateHelper.checkToken();
            validateHelper.validate(teacherid!, setLoginFailed);
        }

        return () => {startEffectRun.current = true;}
    }, []);

    const addFile = (e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedFile) return;

        console.log(selectedFile?.type);

        if (selectedFile?.type === "application/x-zip-compressed") fileService.postFile(selectedFile!, "application/zip", simNameInput, teacherid!);
        if (selectedFile?.type === "") fileService.postFile(selectedFile!, "application/vtkjs", simNameInput, teacherid!);
    }

    return (
        <>
            {loginFailed &&
            <LoginFallback onLoginSuccess={() => {setLoginFailed(false)}} />
            }
            
            <div className="flex flex-col">

                <TeacherTopBar teacherid={teacherid!} />
                <TeacherNav currentPage={2} teacherid={teacherid!} />

                <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] md:min-h-[300px] md:h-[calc(55vh-120px)] px-6 py-2">
                    <h3 className="font-semibold">Add simulation (.zip of VTP files or a single .vtkjs file)</h3>
                    <div className="flex mt-5 justify-center md:mx-auto sm:border sm:border-emerald-100 sm:shadow-md sm:shadow-emerald-100 rounded-sm sm:px-6 sm:py-8">
                        <div className="flex justify-center w-full md:w-1/2">
                            <div className="flex flex-col items-center space-y-2">
                                <div className="flex flex-row space-x-1">
                                    <h4>Title:</h4>
                                    <input className="border-2" type="text" onChange={(e) => setSimNameInput(e.target.value)} value={simNameInput} />
                                </div>
                                <input 
                                    type="file"
                                    accept='.zip, .vtkjs'
                                    onChange={(e) => setSelectedVTPFile(e.target.files![0])}
                                />
                                <ButtonDark btnText="Post" onClickFn={addFile} fullWidth={true} />
                            
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddFilePage;