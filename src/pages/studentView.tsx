import { createContext, useRef, useState } from "react";
import Viewer from "../components/viewer";
import ViewerUI from "../components/viewerUI";
import { ICustomOptions, IUIContext, IVTKContext, IWidget } from "../types";
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';



export const UIContext = createContext<IUIContext>({} as IUIContext);

const StudentView = () => {
  
  const vtkContext = useRef<IVTKContext>(null);
  const customOptionsContext = useRef<ICustomOptions | null>(null);

  const [notes, setNotes] = useState<IWidget[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[] | null>([]);

  const [simLoaded, setSimLoaded] = useState<boolean>(false);

  const [simName, setSimName] = useState<string>("");

  const [optionsLoaded, setOptionsLoaded] = useState<boolean>(false);


  const onLoadSuccess = (name:string) => {
    const defaultSource = vtkContext.current?.allData[0];
    const teacherOptions = customOptionsContext.current?.teacherOptions!;

    //Apply field restrictions if they are applied
    if (teacherOptions.restrictFields && teacherOptions.restrictFields.length > 0) {
      setVisibleFields(teacherOptions.restrictFields);
    } else {
      const allPointFields = defaultSource.getPointData().getArrays().map((ar:vtkDataArray)=> "(p) " + ar.getName());
      const allCellFields = defaultSource.getCellData().getArrays().map((ar:vtkDataArray)=> "(c) " + ar.getName());
      
      setVisibleFields(["Solid color", ...allPointFields, ...allCellFields]);
    }

    if (customOptionsContext.current?.notes) setNotes(customOptionsContext.current?.notes!)

    setSimLoaded(true);

    setSimName(name);
    
  }


  return (
    
    <>
      <div className="fixed w-full h-full top-0 left-0">
        <UIContext.Provider value={{notes, setNotes, visibleFields, simLoaded, simName, optionsLoaded, setOptionsLoaded}} >
          <ViewerUI vtkContext={vtkContext} customOptionsContext={customOptionsContext} />
          <Viewer vtkContext={vtkContext} customOptionsContext={customOptionsContext} onLoadSuccess={onLoadSuccess} />
        </UIContext.Provider>
      </div>
    </>
  );
}

export default StudentView;
