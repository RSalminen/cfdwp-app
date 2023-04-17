import { useRef, useState, useEffect } from "react";
import VtiViewer from "../components/vtiViewer";
import { VtiUIContext } from "./vtiStudentView";
import { ICustomOptions, IVTIContext, IWidget } from "../types";
import VtiTeacherViewerUI from "../components/vtiTeacherViewerUI";
import { validateHelper } from "../helpers/validateHelper";
import { userService } from "../services/userService";
import { useParams } from "react-router-dom";
import LoginFallback from "../components/loginFallback";
import useMyStore from "../store/store";


const VtiTeacherView = () => {

    const { simid } = useParams();

    const startEffectRun = useRef<boolean>(false);

    const vtiContext = useRef<IVTIContext | null>(null);
    const customOptionsContext = useRef<ICustomOptions | null>(null);

    const [simLoaded, setSimLoaded] = useState<boolean>(false);

    const [notes, setNotes] = useState<IWidget[]>([]);

    const [validationComplete, setValidationComplete] = useState<boolean>(false);

    const { authHasFailed, reLoginSuccess } = useMyStore();

    const loadSuccess = () => {        
        setSimLoaded(true);
    }

    const validateTeacher = async () => {
        const isValid = await userService.validateTeacherSim(simid!);
        if (isValid) setValidationComplete(true);
    
        return isValid;
    }
    
    useEffect(() => {
    if (!startEffectRun.current) {
        startEffectRun.current = true;
        
        validateHelper.checkToken();
        validateTeacher();

    }
    }, []);



    const onLoginSuccess = async() => {

        if (await validateTeacher()) {
          reLoginSuccess()
        }
      }
    
    if (!validationComplete) return (
        <LoginFallback onLoginSuccess={() => onLoginSuccess()} />
    )

    return (
        <>
            <div className="h-full w-full absolute flex flex-col">

                <div className="h-[60px] flex items-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
                <div className="flex justify-between w-[98%] m-auto items-center">
                    <img width={180} src="/cfdviewerlogo.svg" alt="CFD Viewer logo" />
                </div>
                </div>

                <div className="w-full h-full flex">
                    <div className="relative w-full h-full">
                        <VtiUIContext.Provider value={{notes, setNotes, simLoaded}} >
                            <VtiViewer vtiContext={vtiContext} customOptionsContext={customOptionsContext} onLoadSuccess={loadSuccess} />
                        </VtiUIContext.Provider>
                    </div>
                    
                    <div>
                        <VtiUIContext.Provider value={{notes, setNotes, simLoaded}} >
                            <VtiTeacherViewerUI vtiContext={vtiContext} customOptionsContext={customOptionsContext} />
                        </VtiUIContext.Provider>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VtiTeacherView;