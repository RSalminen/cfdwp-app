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


  const onLoadSuccess = () => {
    const defaultSource = vtkContext.current?.allData[0];
    const teacherOptions = customOptionsContext.current?.teacherOptions!;

    const allPointFields = defaultSource.getPointData().getArrays().map((ar:vtkDataArray)=> "(p) " + ar.getName());
    const allCellFields = defaultSource.getCellData().getArrays().map((ar:vtkDataArray)=> "(c) " + ar.getName());
    
    setVisibleFields(["Solid color", ...allPointFields, ...allCellFields]);

    if (customOptionsContext.current?.notes) setNotes(customOptionsContext.current?.notes!)

    setSimLoaded(true);
    
  }


  return (
    
    <>
     
      <UIContext.Provider value={{notes, setNotes, visibleFields, simLoaded}} >
        <ViewerUI vtkContext={vtkContext} customOptionsContext={customOptionsContext} />
        <Viewer vtkContext={vtkContext} customOptionsContext={customOptionsContext} onLoadSuccess={onLoadSuccess} />
      </UIContext.Provider>
    </>
  );
}

export default StudentView;
