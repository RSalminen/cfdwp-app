import { useRef, createContext, useState } from 'react';
import VtiViewer from '../components/vtiViewer';
import { ICustomOptions, IVTIContext, IWidget } from '../types';

export interface IVtiUIContext {
    notes:IWidget[];
    setNotes:React.Dispatch<React.SetStateAction<IWidget[]>>
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

    const [notes, setNotes] = useState<IWidget[]>([]);

    return (
        <>
        <VtiUIContext.Provider value={{notes, setNotes, simLoaded}} >
            <VtiViewer vtiContext={vtiContext} customOptionsContext={customOptionsContext} onLoadSuccess={loadSuccess} />
        </VtiUIContext.Provider>
        </>
    )
}

export default VtiStudentView;