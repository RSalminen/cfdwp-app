import { MouseEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { fileService } from "../services/fileService";
import CustomInput from "./customInput";
import Dropzone from "react-dropzone";
import Selection from "./selection";
import ButtonDark from "./buttonDark";


const AddFile = ({onReturn} : {onReturn:Function}) => {
    const [fileToAdd, setFileToAdd] = useState<File>();
    const [simNameInput, setSimNameInput] = useState<string>("");
    const { teacherid } = useParams();

    const [filetypeSelection, setFiletypeSelection] = useState<string>(".vtp");


    const submitFile = (e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!fileToAdd) return;

        console.log(fileToAdd.type);

        fileService.postFile(fileToAdd, filetypeSelection, simNameInput, teacherid!);
    }

    return (
        <div className="w-full h-full fixed top-0 left-0 z-[20] bg-white bg-opacity-90 flex justify-center items-center fade-in-card-fast">

            <div className="flex flex-col space-y-4 bg-white py-2 sm:py-5 px-5 sm:px-10 border rounded-md mx-1 shadow-lg">
                <h3 className="font-semibold text-center">Add simulation</h3>
                <div className="flex flex-col space-y-4 items-center">
                    
                    <div className="w-[90%]">
                        <CustomInput currentValue={simNameInput} labelText="title" onChange={(e:any) => setSimNameInput(e.target.value)} />
                    </div>


                    <Dropzone onDrop={acceptedFiles => setFileToAdd(acceptedFiles[0])}>

                        {({getRootProps, getInputProps}) => (
                            <section>
                            <div className="bg-gray-200 px-3 py-2 border-2 border-dashed border-gray-700" {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            </div>
                            </section>
                        )}

                    </Dropzone>

                    <div className="flex justify-center w-[90%] space-x-4 items-center">
                        <p>Filetype:</p>
                        <Selection allItems={[".vtp", "vti", "vtkjs"]} onChangeFn={(item:string) => setFiletypeSelection(item)} thisItem={null} selectedItem={filetypeSelection} light={true} fullWidth={true} />
                    </div>

                    <div className="flex w-[90%] space-x-2">
                        <ButtonDark btnText="Cancel" onClickFn={() => onReturn()} fullWidth={true} />
                        <ButtonDark btnText="Post" onClickFn={submitFile} fullWidth={true} />
                    </div>

                </div>
            </div>

        </div>
    )
}

export default AddFile;