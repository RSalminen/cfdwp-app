import { useEffect, useRef, useState } from "react";
import { ICustomOptions, IFileObject, IVTKContext } from "../types";
import { viewerHelper } from "../helpers/viewerHelper";
import { fileService } from "../services/fileService";
import { useParams } from "react-router-dom";



const Viewer = ( {vtkContext, customOptionsContext, onLoadSuccess} : {vtkContext:React.MutableRefObject<IVTKContext | null>, customOptionsContext : React.MutableRefObject<ICustomOptions | null>, onLoadSuccess:Function}) => {

    const vtkContainerRef = useRef<HTMLDivElement | null>(null);
    const startEffectRun = useRef<boolean>(false);

    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [simLoaded, setSimLoaded] = useState<boolean>(false);
    
    const { simid, teacherid } = useParams();

    const load = async () => {
        const fileObject : IFileObject = await fileService.getFile(simid!, setLoadProgress);
        customOptionsContext.current = {notes:fileObject.notes, teacherOptions:fileObject.teacher_options}
        await viewerHelper.createViewer(vtkContext, customOptionsContext, vtkContainerRef, fileObject.file, fileObject.filetype);
        setSimLoaded(true);
        onLoadSuccess();
    }

    useEffect(() => {
      if (!startEffectRun.current) {
        load();
      }

      return () => {startEffectRun.current = true}
    },[])

    useEffect(() => {

        return () => {
          if (vtkContext.current) {
            const { fullScreenRenderer, actor, mapper } = vtkContext.current;

            actor!.delete();
            mapper!.delete();
            fullScreenRenderer.delete();
            vtkContainerRef.current = null;

            vtkContext.current = null;
          }
        };
      }, [vtkContainerRef]);
    
    return (
      <>
        {(!simLoaded) &&
          <div className="flex flex-col absolute z-[99] w-full h-full bg-black justify-center items-center text-white">
            <h4 className="text-semibold text-[24px]">Loading</h4>
            <div className="border-b mt-16 relative w-[80%] max-w-[600px] bg-black">
              <img className="w-full" src="/loading.svg" alt="Loading bar" />
              <div style={{width: `${100-loadProgress}%`}} className={`absolute h-full top-0 right-0 bg-black`}></div>
            </div>
          <p className="my-2">{loadProgress}%</p>
        </div>
          
        }
        <div ref={vtkContainerRef}>
        </div>
      </>
    );
}

export default Viewer;