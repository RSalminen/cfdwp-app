import { useRef, createContext, useState } from 'react';
import VtiViewer from '../components/vtiViewer';
import { ICustomOptions, IVTIContext, IVtiUIContext, IWidget } from '../types';

export const VtiUIContext = createContext<IVtiUIContext>({} as IVtiUIContext);

const VtiStudentView = () => {

    const vtiContext = useRef<IVTIContext | null>(null);
    const [customOptionsContext, setCustomOptionsContext] = useState<ICustomOptions | null>(null);

    const [simLoaded, setSimLoaded] = useState<boolean>(false);

    const loadSuccess = () => {        
        setSimLoaded(true);
    }

    const [notes, setNotes] = useState<IWidget[]>([]);

    return (
        <>
        <VtiUIContext.Provider value={{notes, setNotes, simLoaded, customOptionsContext, setCustomOptionsContext}} >
            <VtiViewer vtiContext={vtiContext} onLoadSuccess={loadSuccess} />
        </VtiUIContext.Provider>
        </>
    )
}

export default VtiStudentView;