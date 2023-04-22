import { createContext, useRef, useState, useEffect } from "react";
import Viewer from "../components/viewer";
import ViewerUI from "../components/viewerUI";
import { ICustomOptions, IUIContext, IVTKContext, IWidget } from "../types";



export const UIContext = createContext<IUIContext>({} as IUIContext);

const StudentView = () => {
  
  const vtkContext = useRef<IVTKContext>(null);
  const [customOptionsContext, setCustomOptionsContext] = useState<ICustomOptions | null>(null);

  const [notes, setNotes] = useState<IWidget[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[] | null>([]);

  const [simLoaded, setSimLoaded] = useState<boolean>(false);

  const [simName, setSimName] = useState<string>("");

  const [optionsLoaded, setOptionsLoaded] = useState<boolean>(false);


  const onLoadSuccess = (name:string) => {

    setSimName(name)

  }

  return (
    
    <>
      <div className="fixed w-full h-full top-0 left-0">
        <UIContext.Provider value={{notes, setNotes, visibleFields, setVisibleFields, simLoaded, setSimLoaded, simName, customOptionsContext, setCustomOptionsContext}} >
          <ViewerUI vtkContext={vtkContext} />
          <Viewer vtkContext={vtkContext} onLoadSuccess={onLoadSuccess} />
        </UIContext.Provider>
      </div>
    </>
  );
}

export default StudentView;
