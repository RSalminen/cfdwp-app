import { useContext, useEffect, useRef, useState } from "react";
import { ICustomOptions, IFileObject, IVTKContext } from "../types";
import { viewerHelper } from "../helpers/viewerHelper";
import { fileService } from "../services/fileService";
import { useParams } from "react-router-dom";
import { UIContext } from "../pages/studentView";
import ViewerLoadingScreen from "./viewerLoadingScreen";


const Viewer = ( {vtkContext, customOptionsContext, onLoadSuccess} : {vtkContext:React.MutableRefObject<IVTKContext | null>, customOptionsContext : React.MutableRefObject<ICustomOptions | null>, onLoadSuccess:Function}) => {

  const { simLoaded } = useContext(UIContext);

  const hasEnded = useRef<boolean>(false);

  const vtkContainerRef = useRef<HTMLDivElement | null>(null);
  const startEffectRun = useRef<boolean>(false);

  const [loadProgress, setLoadProgress] = useState<number>(0);
  
  const { simid } = useParams();

  const load = async () => {
    const fileObject : IFileObject = await fileService.getFile(simid!, setLoadProgress);
    customOptionsContext.current = {notes:fileObject.notes, teacherOptions:fileObject.teacher_options}
    
    //I want to stop execution if the user goes back while loading the simulation
    if (hasEnded.current) return;

    await viewerHelper.createViewer(vtkContext, customOptionsContext, vtkContainerRef, fileObject.file, fileObject.filetype);
    
    //Clean up if the user goes back after file is loaded and viewer is loading
    if (hasEnded.current) {
      cleanup();
      return;
    }

    onLoadSuccess(fileObject.simName);
  }

  useEffect(() => {
    if (!startEffectRun.current) {
      load();
    }

    return () => {
      
      //Due to strict mode in React 18, the component get unmounted once at startup in developer mode. Logic below handles this
      if (!(process.env.NODE_ENV === "development")) {
        hasEnded.current = true;
      }

      if (startEffectRun.current) {
        hasEnded.current = true;
      }

      startEffectRun.current = true
    }
  },[]);

  useEffect(() => {

      return () => {
        cleanup();
      };
    }, [vtkContainerRef]);
  
    
  const cleanup = () => {
    if (!vtkContext.current) return;

    const { fullScreenRenderer, actor, mapper } = vtkContext.current;

    actor!.delete();
    mapper!.delete();
    fullScreenRenderer.delete();
    vtkContainerRef.current = null;

    vtkContext.current = null;
    
  }

  return (
    <>
      {(!simLoaded) &&
        <ViewerLoadingScreen loadProgress={loadProgress} />
      }
      
      <div ref={vtkContainerRef}>
      </div>
    </>
  );
}

export default Viewer;