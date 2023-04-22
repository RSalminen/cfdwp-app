import { MouseEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { fileService } from "../services/fileService";
import CustomInput from "./uiComponents/customInput";
import Dropzone from "react-dropzone";
import Selection from "./uiComponents/selection";
import ButtonDark from "./uiComponents/buttonDark";
import ButtonCancel from "./uiComponents/buttonCancel";
import useMyStore from "../store/store";


const AddFile = ({onReturn, onSubmit} : {onReturn:Function, onSubmit:Function}) => {
    const [fileToAdd, setFileToAdd] = useState<File>();
    const [simNameInput, setSimNameInput] = useState<string>("");
    const { teacherid } = useParams();

    const [filetypeSelection, setFiletypeSelection] = useState<string>(".vtp");

    const { updateMessage } = useMyStore();


    const submitFile = async (e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!fileToAdd) return;

        onSubmit();

        updateMessage({ status:1, message: `Uploading simulation ${simNameInput}`});
        const response = await fileService.postFile(fileToAdd, filetypeSelection, simNameInput, teacherid!);

        if (response) updateMessage({ status:2, message: `${simNameInput} uploaded`});
        else updateMessage({ status:3, message: `${simNameInput} failed to upload`});

    }

    const fileSizeFormatter = (size:number) => {
        if (size < 1000) return `${size} B`

        if (size < 1000000) {
            const divNr = size / 1000;
            return `${parseFloat(divNr.toString()).toFixed(2)} KB`;
        }

        if (size < 1000000000) {
            const divNr = size / 1000000;
            return `${parseFloat(divNr.toString()).toFixed(2)} MB`;
        }

        if (size < 1000000000000) {
            const divNr = size / 1000000000;
            return `${parseFloat(divNr.toString()).toFixed(2)} GB`;
        }
    }

    return (
        <div className="w-full h-full min-h-[500px] absolute top-0 left-0 z-[20] bg-white bg-opacity-90 flex justify-center items-center fade-in-card-fast">

            <div className="flex flex-col space-y-4 bg-white py-4 sm:py-5 px-5 sm:px-10 border rounded-md mx-1 shadow-lg">
                <h3 className="font-semibold text-center">Add simulation</h3>
                <div className="flex flex-col space-y-2 sm:space-y-4 items-center">
                    
                    <div className="w-[90%]">
                        <CustomInput currentValue={simNameInput} labelText="title" onChange={(e:any) => setSimNameInput(e.target.value)} />
                    </div>


                    <Dropzone onDrop={acceptedFiles => setFileToAdd(acceptedFiles[0])}>

                        {({getRootProps, getInputProps}) => (
                            <div className="cursor-pointer bg-gray-50 px-8 py-5 border-2 border-dashed border-gray-300 rounded-lg" {...getRootProps()}>
                                <input {...getInputProps()} />
                                <div className="flex flex-col w-full items-center">
                                <svg aria-hidden={true} className="text-gray-400 w-12 h-12" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M518.3 459a8 8 0 0 0-12.6 0l-112 141.7a7.98 7.98 0 0 0 6.3 12.9h73.9V856c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V613.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 459z"></path><path d="M811.4 366.7C765.6 245.9 648.9 160 512.2 160S258.8 245.8 213 366.6C127.3 389.1 64 467.2 64 560c0 110.5 89.5 200 199.9 200H304c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8h-40.1c-33.7 0-65.4-13.4-89-37.7-23.5-24.2-36-56.8-34.9-90.6.9-26.4 9.9-51.2 26.2-72.1 16.7-21.3 40.1-36.8 66.1-43.7l37.9-9.9 13.9-36.6c8.6-22.8 20.6-44.1 35.7-63.4a245.6 245.6 0 0 1 52.4-49.9c41.1-28.9 89.5-44.2 140-44.2s98.9 15.3 140 44.2c19.9 14 37.5 30.8 52.4 49.9 15.1 19.3 27.1 40.7 35.7 63.4l13.8 36.5 37.8 10C846.1 454.5 884 503.8 884 560c0 33.1-12.9 64.3-36.3 87.7a123.07 123.07 0 0 1-87.6 36.3H720c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h40.1C870.5 760 960 670.5 960 560c0-92.7-63.1-170.7-148.6-193.3z"></path></svg>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">A zip containing .vtp, .vti or .vtkjs files</p>
                                </div>
                            </div>
                        )}
                    </Dropzone>

                    {fileToAdd && 
                    <div className="flex space-x-1 text-[12px] sm:text-[15px]">
                        <p className="font-semibold">File:</p>
                        <p className="overflow-hidden text-ellipsis max-w-[200px] whitespace-nowrap">{fileToAdd.name},</p>
                        <p>{fileSizeFormatter(fileToAdd.size)}</p>
                    </div>
                    }

                    <div className="flex justify-center w-[90%] space-x-2 items-center">
                        <p>Filetype:</p>
                        <div className="min-w-[90px]"><Selection allItems={[".vtp", ".vti", ".vtkjs"]} onChangeFn={(item:string) => setFiletypeSelection(item)} thisItem={null} selectedItem={filetypeSelection} light={true} fullWidth={true} /></div>
                    </div>

                    <div className="flex w-[90%] space-x-2">
                        <ButtonDark btnText="Submit" onClickFn={submitFile} fullWidth={true} deactive={simNameInput.length === 0 || !fileToAdd} />
                        <ButtonCancel btnText="Cancel" onClickFn={() => onReturn()} fullWidth={true} />
                    </div>

                </div>
            </div>

        </div>
    )
}

export default AddFile;