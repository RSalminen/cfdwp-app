import { createContext, useEffect, useRef, useState } from "react";
import Viewer from "../components/viewer";
import ViewerUI from "../components/viewerUI";
import { ICustomOptions, IUIContext, IVTKContext, IWidget } from "../types";
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
  const customOptionsContext = useRef<ICustomOptions | null>(null);

  const [notes, setNotes] = useState<IWidget[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[] | null>([]);

  const [simLoaded, setSimLoaded] = useState<boolean>(false);

  const { authHasFailed, reLoginSuccess } = useMyStore();

  const startEffectRun = useRef<boolean>(false);

  const [validationComplete, setValidationComplete] = useState<boolean>(false);

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
  

  const onLoadSuccess = () => {
    const defaultSource = vtkContext.current?.allData[0];
    const teacherOptions = customOptionsContext.current?.teacherOptions!;

    const allPointFields = defaultSource.getPointData().getArrays().map((ar:vtkDataArray)=> "(p) " + ar.getName());
    const allCellFields = defaultSource.getCellData().getArrays().map((ar:vtkDataArray)=> "(c) " + ar.getName());
    
    setVisibleFields(["Solid color", ...allPointFields, ...allCellFields]);

    if (customOptionsContext.current?.notes) setNotes(customOptionsContext.current?.notes!)
    
    setSimLoaded(true);

  }

  const onLoginSuccess = async() => {

    if (await validateTeacher()) {
      reLoginSuccess()
    }
  }

  if (!validationComplete) return (
    <LoginFallback onLoginSuccess={() => onLoginSuccess()} />
  )


  else return (
    <>
      <div className="h-full w-full absolute flex flex-col">

        <div className="h-[60px] flex items-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
          <div className="flex justify-between w-[98%] m-auto items-center">
              <img width={180} src="/cfdviewerlogo.svg" alt="CFD Viewer logo" />
          </div>
        </div>

        <div className="w-full h-full flex">
            <div className="relative w-full h-full">
              <UIContext.Provider value={{notes, setNotes, visibleFields, simLoaded}} >
                <ViewerUI vtkContext={vtkContext} customOptionsContext={customOptionsContext} />
                <Viewer vtkContext={vtkContext} customOptionsContext={customOptionsContext} onLoadSuccess={onLoadSuccess} />
              </UIContext.Provider>
            </div>
            
            <div>
              <UIContext.Provider value={{notes, setNotes, visibleFields, simLoaded}} >
                <TeacherViewerUI vtkContext={vtkContext} customOptionsContext={customOptionsContext} />
              </UIContext.Provider>
            </div>
          </div>
        </div>

    </>
  );
}

export default TeacherView;
