import { MouseEvent, useState } from "react";
import { useParams } from "react-router-dom";
import ButtonDark from "./buttonDark";
import { fileService } from "../services/fileService";
import CustomInput from "./customInput";


const AddFile = ({onReturn} : {onReturn:Function}) => {
    const [selectedFile, setSelectedVTPFile] = useState<File>();
    const [simNameInput, setSimNameInput] = useState<string>("");
    const { teacherid } = useParams();


    const submitFile = (e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedFile) return;

        console.log(selectedFile?.type);

        if (selectedFile?.type === "application/x-zip-compressed") fileService.postFile(selectedFile!, "application/zip", simNameInput, teacherid!);
        if (selectedFile?.type === "") fileService.postFile(selectedFile!, "application/vtkjs", simNameInput, teacherid!);
    }

    return (
        <div className="w-full h-full fixed top-0 left-0 z-[20] bg-white bg-opacity-90 flex justify-center items-center fade-in-card-fast">

            <div className="flex flex-col space-y-4 bg-white py-2 sm:py-5 px-5 sm:px-10 border rounded-md mx-1 shadow-lg">
                <h3 className="font-semibold text-center">Add simulation</h3>
                <div className="flex flex-col space-y-4 items-center">
                    
                    <div className="w-[90%]">
                        <CustomInput currentValue={simNameInput} labelText="title" onChange={(e:any) => setSimNameInput(e.target.value)} />
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div className="flex flex-col items-center justify-center py-6 px-5">
                                <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Zip file containing the .vtp, .vtkjs or .vti files</p>
                            </div>
                            <input 
                                type="file"
                                accept='.zip, .vtkjs'
                                onChange={(e) => setSelectedVTPFile(e.target.files![0])}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <ButtonDark btnText="Post" onClickFn={submitFile} fullWidth={true} />

                    <div className="flex justify-end items-center w-full hover:cursor-pointer" onClick={() => onReturn()}>
                        <p className="font-semibold text-[14px]">Return</p>
                        <svg className="h-5 w-5" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="2" d="M9,4 L4,9 L9,14 M18,19 L18,9 L5,9" transform="matrix(1 0 0 -1 0 23)"></path></svg>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default AddFile;