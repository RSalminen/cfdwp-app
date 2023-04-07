import { useEffect, useRef, useState } from 'react';

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera'
import { fileService } from '../services/fileService';

import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';

import JSZip from "jszip";

import {
  ColorMode,
  ScalarMode,
} from '@kitware/vtk.js/Rendering/Core/Mapper/Constants';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkLookupTable from '@kitware/vtk.js/Common/Core/LookupTable';

import { useNavigate, useParams } from 'react-router-dom';
import { applyStep, aTest } from './test';
import Selection from '../components/selection';


import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';


import { ITeacherOptions, IWidget } from '../types';
import WidgetCard from '../components/widgetCard';
import Draggable from 'react-draggable';

//import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';


const TeacherView = () => {

  interface IVTKContext {
    openGLRenderer?: vtkOpenGLRenderWindow;
    renderWindow?: vtkRenderWindow;
    renderer?: vtkRenderer;
    actor?: vtkActor;
    mapper?: vtkMapper;
    RenderWindowInteractor?: vtkRenderWindowInteractor;
    currentTimeStep?:number,
    allData: any;
    sceneImporter: any;
    widgetManager:vtkWidgetManager;
    scalarBarActor:vtkScalarBarActor;
    lookupTable:any;
  }

  const navigate = useNavigate();

  const vtkContainerRef = useRef<any>(null);
  const fpsContainerRef = useRef<any>(null);

  const context = useRef<any>(null);
  const effectRun = useRef<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [simLoaded, setSimLoaded] = useState<boolean>(false);

  const [fields, setFields] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  const [selectedFields, setSelectedFields] = useState<string[] | null>([]);

  const { simid, teacherid } = useParams();

  const timerContext = useRef<NodeJS.Timer | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<string>("Notes");


  const defaultCamera = useRef<object | null>(null);

  const [widgets, setWidgets] = useState<IWidget[]>([]);

  const [widgetOpen, setWidgetOpen] = useState<boolean>(false);
  const [currentWidget, setCurrentWidget] = useState<number>(0);

  const teacherOptions = useRef<ITeacherOptions>();

  const loadContent = async () => {
    const content = await fileService.getContent(simid!);
    setWidgets(content.widgets);

    teacherOptions.current = content.teacher_options;
    if (teacherOptions.current) setSelectedFields(content.teacher_options.restrictFields);
  }

  const load = async () => {
    await loadContent();
    await createViewer();
    setSimLoaded(true);
  }

  useEffect(() => {

    if (!effectRun.current) {

      load();
    
    }

    return () => {effectRun.current = true}
  
  }, [vtkContainerRef]);

  const createViewer = async () => {

    const renderWindow = vtkRenderWindow.newInstance();
    const renderer = vtkRenderer.newInstance({ background: [0.10196, 0.10196, 0.10196] });
    renderWindow.addRenderer(renderer);

    const lookupTable = vtkColorTransferFunction.newInstance();
    const mapper = (vtkMapper as any).newInstance({
      interpolateScalarsBeforeMapping: false,
      useLookupTableScalarRange: true,
      lookupTable,
      scalarVisibility: false,
    });

    renderer.resetCamera();

    // ----------------------------------------------------------------------------
    // Use OpenGL as the backend to view all this
    // ----------------------------------------------------------------------------

    const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
    renderWindow.addView(openglRenderWindow);

    openglRenderWindow.setContainer(vtkContainerRef.current);

    // ----------------------------------------------------------------------------
    // Capture size of the container and set it to the renderWindow
    // ----------------------------------------------------------------------------
    
    const { width, height } = vtkContainerRef.current.getBoundingClientRect();
    
    openglRenderWindow.setSize(width, height);

    // ----------------------------------------------------------------------------
    // Setup an interactor to handle mouse events
    // ----------------------------------------------------------------------------

    const interactor = vtkRenderWindowInteractor.newInstance();
    interactor.setView(openglRenderWindow);

    interactor.initialize();
    interactor.bindEvents(vtkContainerRef.current);

    // ----------------------------------------------------------------------------
    // Setup interactor style to use
    // ----------------------------------------------------------------------------

    interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    interactor.setDesiredUpdateRate(15);

    // ----------------------------------------------------------------------------
    // Load VTP file and display it
    // ----------------------------------------------------------------------------


    const fileObject = await fileService.getFile(simid!, setLoadProgress);

    const zipArrayBuffer = fileObject.file;

    let defaultSource;
    let timeSeriesData = null;
    let readRes = null;
    
    if (fileObject.fileType?.includes("application/zip"))
    {
      const jszip = new JSZip();

      const zip = await jszip.loadAsync(zipArrayBuffer);

      const fileNameArray = [];

      for (__filename in zip.files) {
        fileNameArray.push(__filename);
      }

      console.log(fileNameArray);

      const fileDataArray = await Promise.all(fileNameArray.map(async (filename:string) => {
        const filedata = await zip.file(filename)?.async('arraybuffer');
        const vtpReader = vtkXMLPolyDataReader.newInstance();
        vtpReader.parseAsArrayBuffer(filedata!);
        return vtpReader.getOutputData(0)
      }));


      timeSeriesData = fileDataArray;
  
       /* if (fileDataArray.length > 1) {
        timeSeriesData = fileDataArray.filter((ds) => ds.getCellData().getArrayByName('TimeValue') !== null);
        timeSeriesData.sort((a,b) => a.getCellData().getArrayByName('TimeValue') - b.getCellData().getArrayByName('TimeValue'));
      } */

      defaultSource = timeSeriesData[0];
      
    }

    if (fileObject.fileType?.includes("application/vtkjs"))
    {
      readRes = await aTest(zipArrayBuffer, renderer, renderWindow);
      defaultSource = readRes.source;
    }

    mapper.setInputData(defaultSource);

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    renderer.addActor(actor);
    

    const scalarBarActor = vtkScalarBarActor.newInstance({
      position: [0,0,0],
      drawNanAnnotation:false,
    });

    

    renderer.addActor(scalarBarActor);
    //const widgetManager = vtkWidgetManager.newInstance();
    //widgetManager.setRenderer(renderer);

    renderer.resetCamera();
    renderer.setBackground(0.10196, 0.10196, 0.10196);

    renderWindow.render();

    const allFields = defaultSource.getPointData().getArrays().map((ar:vtkDataArray)=>ar.getName());
    setFields(allFields);
    
    if (teacherOptions.current?.restrictFields === null) {
      setSelectedFields(allFields);

    }

    defaultCamera.current = renderer.getActiveCamera().toJSON();

    context.current = {
        renderWindow,
        renderer,
        mapper,
        actor,
        interactor,
        currentTimeStep:0,
        allData:timeSeriesData,
        sceneImporter:readRes?.sceneImporter,
        scalarBarActor,
        lookupTable
        //widgetManager
    };
    
  }

  useEffect(() => {
    if (activeField !== null) {
      changeField(activeField);
    }
  }, [activeField]);

  const changeField = async (newField:string) => {

    if (!context.current) return;
  
    const { mapper, renderer, renderWindow, allData, sceneImporter, currentTimeStep, scalarBarActor, lookupTable } : IVTKContext = context.current;

    /* const fpsMonitor = vtkFPSMonitor.newInstance();
    fpsMonitor.setRenderWindow(renderWindow);
    fpsMonitor.setContainer(fpsContainerRef.current); */

    let source;
    if (sceneImporter) source = sceneImporter.getScene()[0].source.getOutputData();
    else source = allData[currentTimeStep!];

    //const scalarsArray : vtkDataArray[] = source.getPointData().getArrays();
    
    const dataArray : vtkDataArray = source.getPointData().getArrayByName(newField);
    
    const dataRange = dataArray.getRange();

    let scalarMode = ScalarMode.USE_POINT_FIELD_DATA;
    let colorMode = ColorMode.MAP_SCALARS;
    
    const preset = vtkColorMaps.getPresetByName("jet");
    
    lookupTable.applyColorMap(preset);
    lookupTable.setMappingRange(dataRange[0], dataRange[1]);
    lookupTable.updateRange();


    mapper?.set({
      colorByArrayName: newField,
      interpolateScalarsBeforeMapping: false,
      colorMode,
      scalarMode,
      scalarVisibility: true,
    });

    const lut : vtkLookupTable = mapper?.getLookupTable();
    lut.setVectorModeToMagnitude();

/*     scalarBarActor.setAxisLabel(activeField!);
    scalarBarActor.setScalarsToColors(mapper!.getLookupTable());
     */

    renderer?.resetCamera();
    renderWindow?.render();

  }

  const playClicked = () => {
    timerContext.current = setInterval(advanceTime, 100);
    setPlaying(true);
  }

  const stopClicked = () => {
    clearInterval(timerContext.current!);
    timerContext.current = null;
    setPlaying(false);
  }

  const advanceTime = () => {
    const { mapper, renderWindow, allData, currentTimeStep, sceneImporter } : IVTKContext = context.current;

    let source;

    if (sceneImporter) {
      
      if (currentTimeStep! < sceneImporter.getAnimationHandler().getTimeSteps().length-1) context.current.currentTimeStep = currentTimeStep! + 1;
      else context.current.currentTimeStep = 0;

      source = applyStep(currentTimeStep, sceneImporter);
    }

    else {

      if (currentTimeStep! < allData.length-1) context.current.currentTimeStep = currentTimeStep! + 1;
      else context.current.currentTimeStep = 0;

      source = allData[currentTimeStep!];
  
    }

    mapper?.setInputData(source);  
    renderWindow?.render();
  }

  const openWidget = (widget:IWidget) => {
    const { renderer, renderWindow } : IVTKContext = context.current;
    
    setWidgetOpen(true);
    const newCamera :vtkCamera = vtkCamera.newInstance(widget.camera!);
    renderer!.setActiveCamera(newCamera);

    renderWindow?.render();
    
  }

  useEffect(() => {
    if (!simLoaded) return;

    openWidget(widgets[currentWidget]);
  }, [currentWidget]);


  return (
    <div className="fixed h-full w-full overflow-hidden">
      <div className='overflow-hidden h-full flex flex-col'>

        {(!simLoaded) && 
        <div className="flex flex-col w-full h-full bg-white absolute z-[50] justify-center items-center">
          <p>Loading...</p>
          <p>{loadProgress}%</p>
        </div>}

        <div className="flex flex-col">
    
          <div className="h-[60px] py-1 px-2 flex justify-evenly items-center w-full bg-black border-y border-emerald-100">
            <div className="text-emerald-100">
              <h5>A simulation test</h5>
            </div>
            
            {simLoaded &&
              <div>
                <Selection selectedItem={activeField} onChangeFn={(item:string) => setActiveField(item)} allItems={selectedFields!} thisItem="Select Field..." />
              </div>
            }

            <div className="h-7 w-12 border border-emerald-100 flex items-center justify-around rounded-sm">
              <svg className="fill-emerald-100 h-5 w-5 border-r flex-1 border-emerald-100" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.5 3.5A.5.5 0 004 4v8a.5.5 0 001 0V4a.5.5 0 00-.5-.5z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M5.696 8L11.5 4.633v6.734L5.696 8zm-.792-.696a.802.802 0 000 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L4.904 7.304z" clip-rule="evenodd"></path></svg>
              
              {(!playing) ? <svg onClick={playClicked} className="flex-1 h-5 w-5 fill-emerald-100" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 010 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" clip-rule="evenodd"></path></svg>
              : <svg onClick={stopClicked} className="flex-1 h-5 w-5 fill-emerald-100" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.5 5A1.5 1.5 0 015 3.5h6A1.5 1.5 0 0112.5 5v6a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 11V5zM5 4.5a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V5a.5.5 0 00-.5-.5H5z" clip-rule="evenodd"></path></svg>
              }

            </div>

          </div>
        </div>

        <div ref={vtkContainerRef} className="h-[calc(100%-60px)]">
        </div>
      </div>

      {(menuVisible) &&
      <div className="h-[calc(100%-60px)] transition-all overflow-y-hidden flex flex-col min-w-[300px] w-[20vw] right-0 top-[60px] bg-white absolute z-[2] bg-opacity-95 pl-4 pr-8 py-2">
        
        <div className="flex space-x-4 pb-2 mb-2 border-b border-emerald-600">
          <div className={`${menuTab === "Notes" && "border-b-[3px] border-emerald-600"} cursor-pointer`} onClick={() => setMenuTab("Notes")}>Notes</div>
        </div>

        <div className="flex flex-col justify-between flex-1 h-0 pb-1">
          
          {menuTab === "Notes" &&
          <div className="flex flex-col">
              {widgets.map((widget) => (
                <div className="flex flex-col space-y-2 border-2 p-2 bg-emerald-100 cursor-pointer rounded-md" onClick={() => openWidget(widget)}>
                  <h5 className="text-[15px] font-semibold">{widget.title}</h5>
                  <p className="text-[13px]">{widget.description}</p>
                </div>
              ))}
          </div>
          }

        </div>
        
      </div>
      }
      <div className={`${menuVisible ? "right-6" : "right-4"} absolute z-[7] transition-all top-[50vh] flex flex-col space-y-1.5`}>
        <div className={`${widgetOpen ? "bg-emerald-900" : "bg-black"} h-9 w-9 rounded-xl flex justify-center items-center cursor-pointer`} onClick={() => widgetOpen ? setWidgetOpen(false) : openWidget(widgets[currentWidget])}>
          <svg className="h-[22px] w-[22px] fill-white" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm416 0H627.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path></svg>
        </div>
        
        <div className={`${menuVisible ? "bg-emerald-900" : "bg-black"} h-9 w-9 rounded-xl flex justify-center items-center cursor-pointer`} onClick={() => setMenuVisible(!menuVisible)}>
          <svg className="h-[20px] w-[20px] stroke-white" stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </div>
      </div>

      {widgetOpen &&
      
      <Draggable handle=".widgetHandle" bounds={{bottom:10, right:400}}>
        <div className="absolute z-[8] w-[350px] h-[200px] bg-white bg-opacity-95 bottom-4 right-[400px] border-2 border-emerald-900 shadow-md shadow-gray-800 rounded-md">
          <WidgetCard widgets={widgets} currentWidgetNr={currentWidget} setCurrentWidget={setCurrentWidget} setWidgetOpen={setWidgetOpen} />
        </div>
      </Draggable>

      }

      {/* <div ref={fpsContainerRef} className="absolute z-50 top-0 left-0 bg-white"></div> */}
    </div>
  );
}

export default TeacherView;
