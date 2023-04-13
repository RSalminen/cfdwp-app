import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';




export interface IWidget {
    title:string,
    description:string,
    camera:object|null
}

export interface ITeacherOptions {
    restrictFields: string[] | null,
    color: string,
}

export interface ITeacherCollObj {
    id: number,
    name: number,
    date_added: string,
}

export interface ITeacherSimObj {
    id: string,
    simtitle: string,
    added_date: string,
    filetype: number,
    collection_name: number
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
}