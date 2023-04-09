import { useParams } from "react-router-dom";
import CustomInput from "./customInput";
import { useState } from "react";
import ButtonDark from "./buttonDark";
import ButtonCancel from "./buttonCancel";
import { collectionService } from "../services/collectionService";

const AddCollection = ({onReturn} : {onReturn:Function}) => {

    const {teacherid} = useParams();
    const [collectionTitle, setCollectionTitle] = useState<string>("")

    const submitCollection = async (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (collectionTitle.length === 0) return;

        collectionService.postCollection(collectionTitle, teacherid!);

    }

    return (
        <div className="w-full h-full fixed top-0 left-0 z-[20] bg-white bg-opacity-90 flex justify-center items-center fade-in-card-fast">

            <div className="flex flex-col space-y-3 sm:space-y-4 bg-white py-4 sm:py-5 px-5 sm:px-7 border rounded-md mx-1 shadow-lg">
                
                <h3 className="font-semibold text-center">Add a collection</h3>
                <div className="flex flex-col space-y-2 sm:space-y-4 items-center min-w-[200px]">
                    
                    <CustomInput currentValue={collectionTitle} labelText="Name" onChange={(e:any) => setCollectionTitle(e.target.value)} />

                    <div className="flex w-[90%] space-x-2">
                        <ButtonDark btnText="Submit" onClickFn={submitCollection} fullWidth={true} />
                        <ButtonCancel btnText="Cancel" onClickFn={() => onReturn()} />
                    </div>

                </div>
            </div>

        </div>
        
    );
}

export default AddCollection;