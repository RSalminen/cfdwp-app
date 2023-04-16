import { useRef, createContext, useState } from 'react';
import VtiViewer from '../components/vtiViewer';
import { ICustomOptions, IVTIContext } from '../types';

export interface IVtiUIContext {
    simLoaded:boolean;
}

export const VtiUIContext = createContext<IVtiUIContext>({} as IVtiUIContext);

const VtiStudentView = () => {

    const startEffectRun = useRef<boolean>(false);

    const vtiContext = useRef<IVTIContext | null>(null);
    const customOptionsContext = useRef<ICustomOptions | null>(null);

    const [simLoaded, setSimLoaded] = useState<boolean>(false);

    const loadSuccess = () => {        
        setSimLoaded(true);
    }


    return (
        <>
        <VtiUIContext.Provider value={{simLoaded}} >
            <VtiViewer vtiContext={vtiContext} customOptionsContext={customOptionsContext} onLoadSuccess={loadSuccess} />
        </VtiUIContext.Provider>
        </>
    )
}

export default VtiStudentView;