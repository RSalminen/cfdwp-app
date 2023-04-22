import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';



export interface IWidget {
    title:string,
    description:string,
    camera:object|null
}

export interface ITeacherOptions {
    restrictFields?: string[],
    startingField?: string,
    startingPreset?: string,
}

export interface ITeacherCollObj {
    id: number,
    name: string,
    date_added: string,
    file_ids:number[]
}

export interface ITeacherSimObj {
    id: string,
    simtitle: string,
    added_date: string,
    filetype: number,
}

export interface IVTKContext {
    renderWindow?: vtkRenderWindow;
    renderer?: vtkRenderer;
    actor?: vtkActor;
    mapper?: vtkMapper;
    RenderWindowInteractor?: vtkRenderWindowInteractor;
    currentTimeStep?:number,
    allData: any;
    sceneImporter?:any;
    lookupTable:any;
    defaultCamera:any;
    fullScreenRenderer:any;
}

export interface ICustomOptions {
    notes: IWidget[],
    teacherOptions: ITeacherOptions,
}

export interface IFileObject {
    simName: string;
    file: File;
    filetype: number;
    notes: IWidget[];
    teacher_options: ITeacherOptions;
}

export interface IUIContext {
    notes: IWidget[];
    setNotes: React.Dispatch<React.SetStateAction<IWidget[]>>;
    visibleFields: string[] | null;
    simLoaded: boolean;
    simName: string;
    optionsLoaded:boolean;
    setOptionsLoaded:React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IVTIContext {
    renderWindow?: vtkRenderWindow;
    renderer?: vtkRenderer;
    actor?: vtkActor;
    mapper?: vtkMapper;
    RenderWindowInteractor?: vtkRenderWindowInteractor;
    currentTimeStep?:number,
    allData?: any;
    lookupTable?:any;
    defaultCamera?:any;
    fullScreenRenderer?:any;
    controllerWidget:any;
}

export interface IMessage {
    message:string;
    status:number;
}