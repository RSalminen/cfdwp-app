import { useEffect, useRef, useState } from "react";
import Viewer from "../components/viewer";
import ViewerUI from "../components/viewerUI";
import { ICustomOptions, IVTKContext, IWidget } from "../types";
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import TeacherViewerUI from "../components/teacherViewerUI";
import { UIContext } from "./studentView";
import useMyStore from "../store/store";
import LoginFallback from "../components/loginFallback";
import { userService } from "../services/userService";
import { validateHelper } from "../helpers/validateHelper";
import { useParams } from "react-router-dom";

const TeacherView = () => {
  
  const { simid } = useParams();

  const vtkContext = useRef<IVTKContext>(null);
  const [customOptionsContext, setCustomOptionsContext] = useState<ICustomOptions | null>(null);

  const [notes, setNotes] = useState<IWidget[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[] | null>([]);

  const [simLoaded, setSimLoaded] = useState<boolean>(false);

  const [simName, setSimName] = useState<string>("");

  const { authHasFailed, reLoginSuccess } = useMyStore();

  const startEffectRun = useRef<boolean>(false);

  const [validationComplete, setValidationComplete] = useState<boolean>(false);

  const validateTeacher = async () => {
    const isValid = await userService.validateTeacherSim(simid!);
    setValidationComplete(true);

    return isValid;
  }

  useEffect(() => {
    if (!startEffectRun.current) {
      startEffectRun.current = true;
      
      validateHelper.checkToken();
      validateTeacher();

    }
  }, []);

  const onLoadSuccess = (name:string) => {
    
    setSimName(name);
    setSimLoaded(true);

  }

  const onLoginSuccess = async() => {

    if (await validateTeacher()) {
      reLoginSuccess()
    }
  }

  if (authHasFailed && validationComplete) return (
    <LoginFallback onLoginSuccess={() => onLoginSuccess()} />
  )


  else return (
    <>
      <div className="h-full w-full fixed flex flex-col">

        <div className="h-[60px] flex items-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
          <div className="flex justify-between w-[98%] m-auto items-center">
              <img width={180} src="/cfdviewerlogo.svg" alt="CFD Viewer logo" />
          </div>
        </div>

        <div className="w-full h-full flex">
          <div className="relative flex-1 h-full">
            <UIContext.Provider value={{notes, setNotes, visibleFields, setVisibleFields, simLoaded, setSimLoaded, simName, customOptionsContext, setCustomOptionsContext}} >
              <ViewerUI vtkContext={vtkContext} />
              <Viewer vtkContext={vtkContext} onLoadSuccess={onLoadSuccess} />
            </UIContext.Provider>
          </div>
          
          <div className="h-full w-[280px] relative">
            <UIContext.Provider value={{notes, setNotes, visibleFields, setVisibleFields, simLoaded, setSimLoaded, simName, customOptionsContext, setCustomOptionsContext}} >
              <TeacherViewerUI vtkContext={vtkContext} />
            </UIContext.Provider>
          </div>
        </div>
      </div>
    </>
  );
}

export default TeacherView;
