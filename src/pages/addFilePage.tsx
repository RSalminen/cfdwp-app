import { MouseEvent, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ButtonDark from "../components/buttonDark";
import { fileService } from "../services/fileService";

const AddFilePage = ({setSuccessNotification}:{setSuccessNotification:React.Dispatch<React.SetStateAction<string | null>>}) => {
    const [selectedFile, setSelectedVTPFile] = useState<File>();
    const [simNameInput, setSimNameInput] = useState<string>("");
    const { teacherid } = useParams();

    //const loaded = useRef<boolean>(false);

    const addFile = (e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedFile) return;

        console.log(selectedFile?.type);

        if (selectedFile?.type === "application/x-zip-compressed") fileService.postFile(selectedFile!, "application/zip", simNameInput, teacherid!);
        if (selectedFile?.type === "") fileService.postFile(selectedFile!, "application/vtkjs", simNameInput, teacherid!);
    }

    //if (!loaded.current) return null;

    return (
        <div className="flex flex-col">

            <div className="h-[60px] flex items-center bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
                <div className="flex justify-between w-[80%] m-auto items-center">
                    <h1 className='text-[30px] font-bold font-serif w-[70%]'>CFDWebProject</h1>
                </div>
            </div>

            <div className="w-full h-10 flex justify-center bg-gray-50 border-b border-emerald-800">
                <div className="w-[80%] h-full flex space-x-10 items-center text-[14px] font-semibold">
                    <Link to={`/teacher/${teacherid}`}>Home</Link>
                    <h5 className="border-b-2 border-emerald-900">Post simulation</h5>
                </div>
            </div>

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
    )
}

export default AddFilePage;