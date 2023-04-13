import { useEffect, useRef, useState } from 'react';

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
import MultiSelection from '../components/multiSelection';
import { applyStep, aTest } from './test';
import Selection from '../components/selection';
import ButtonDark from '../components/buttonDark';

import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkSphereWidget from '../widgets/poiWidget';
import vtkCubeSource from '@kitware/vtk.js/Filters/Sources/CubeSource';
import CustomInput from '../components/customInput';
import ButtonDarkMid from '../components/buttonDarkMid';
import CustomTextArea from '../components/customTextArea';
import { ICustomOptions, ITeacherOptions, IVTKContext, IWidget } from '../types';
import ListedWidget from '../components/listedWidget';

import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';

import { vec3 } from 'gl-matrix';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
import { userService } from '../services/userService';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

const TeacherView = () => {

  const { simid, teacherid } = useParams();

  const navigate = useNavigate();

  const vtkContainerRef = useRef<any>(null);
  const context = useRef<any>(null);
  const effectRun = useRef<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [simLoaded, setSimLoaded] = useState<boolean>(false);

  const [fields, setFields] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);

  const [selectedFields, setSelectedFields] = useState<string[] | null>([]);


  const timerContext = useRef<NodeJS.Timer | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<string>("General");


  const defaultCamera = useRef<object | null>(null);

  const [titleInput, setTitleInput] = useState<string>("");
  const [descriptionArea, setDescriptionArea] = useState<string>("");
  const [cam, setCam] = useState<object | null>(null);

  const [widgets, setWidgets] = useState<IWidget[]>([])

  const teacherOptions = useRef<ITeacherOptions>();

  const customOptionsContext = useRef<ICustomOptions>

  const loadContent = async () => {
    const content = await fileService.getContent(simid!);
    setWidgets(content.widgets);

    teacherOptions.current = content.teacher_options;
    if (teacherOptions.current) setSelectedFields(content.teacher_options.restrictFields);
  }

  const load = async () => {
    const loggedUserJSON = window.localStorage.getItem('loggedCFDWPUser');
    if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON);
        userService.setToken(user.token);
    }

    const teacherValid = await userService.validateTeacherSim(simid!);
    
    if (!teacherValid) {
      navigate('/login');
      return;
    }

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

    const fullScreenRenderWindow = (vtkFullScreenRenderWindow as any).newInstance({
      background: [0.10196, 0.10196, 0.10196],
      rootContainer: vtkContainerRef.current,
    });

    const renderer = fullScreenRenderWindow.getRenderer();
    const renderWindow = fullScreenRenderWindow.getRenderWindow();

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



    // ----------------------------------------------------------------------------
    // Setup an interactor to handle mouse events
    // ----------------------------------------------------------------------------

    const interactor = renderWindow.getInteractor();

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
    
    if (fileObject.filetype === 1)
    {
      const jszip = new JSZip();

      const zip = await jszip.loadAsync(zipArrayBuffer);

      const fileNameArray = [];

      for (__filename in zip.files) {
        fileNameArray.push(__filename);
      }

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

    if (fileObject.filetype === 3)
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
    };
    
  }

  useEffect(() => {
    if (activeField !== null) {
      changeField(activeField);
    }
  }, [activeField]);

  const changeField = async (newField:string) => {
    
    if (!context.current) return;
  
    const { mapper, renderer, renderWindow, allData, sceneImporter, currentTimeStep, lookupTable } : IVTKContext = context.current;

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

   /*  scalarBarActor.setAxisLabel(activeField!);
    scalarBarActor.setScalarsToColors(mapper!.getLookupTable()); */
    
    //actor?.getProperty().setPointSize(2);
    
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


  const addWidget = () => {
    const { widgetManager, sceneImporter, allData, currentTimeStep } = context.current;
    /*
    let source;
    if (sceneImporter) source = sceneImporter.getScene()[0].source.getOutputData();
    else source = allData[currentTimeStep!];

     const widget = vtkSphereWidget.newInstance();
    const cube = vtkCubeSource.newInstance();
    widget.placeWidget(source.getBounds());
    const widgetHandle = widgetManager.addWidget(widget);
    widgetManager.grabFocus(widget); */

    const widgetObject:IWidget = {
      title: titleInput,
      description: descriptionArea,
      camera:cam,
    }


    setTitleInput("");
    setDescriptionArea("");
    setCam(null);

    setWidgets(widgets.concat(widgetObject));

  }

  const saveCamera = () => {
    const { renderer } : IVTKContext = context.current;
    setCam(renderer!.getActiveCamera().toJSON());
    
  }

  const setCameraToSaved = () => {
    const { renderer, renderWindow } : IVTKContext = context.current;

    if (cam === null) {
      const newCamera :vtkCamera = vtkCamera.newInstance(defaultCamera.current!);
      renderer!.setActiveCamera(newCamera);
      renderWindow?.render();
      return;
    }
    

    const newCamera :vtkCamera = vtkCamera.newInstance(cam!);
    renderer!.setActiveCamera(newCamera);

    renderWindow?.render();
    
  }

  const saveChanges = async () => {
    
    const newTeacherOptions = {
      restrictFields: selectedFields,
      color: "jet",
    }
    await fileService.updateContent(widgets, newTeacherOptions, simid!);

  }

  const calculateClicked = () => {
    const { sceneImporter, allData, currentTimeStep } : IVTKContext = context.current;

    let source;
    if (sceneImporter) source = sceneImporter.getScene()[0].source.getOutputData();
    else source = allData[currentTimeStep!];


    const velocityArray : Float32Array = source.getPointData().getArrayByName("U").getData();
    
    const pointArrays = source.getPointData().getArrays();

    let scalar = 2.0;

  /*   for (let i = 0; i < velocityArray.length; i += 3) {
      velocityArray[i] = velocityArray[i] * 2;
     
    } */


  }

  return (
    <>
    <div className='w-full h-full' ref={vtkContainerRef}>
    </div>

    <div className="h-full w-full top-0 left-0 absolute z-[2] pointer-events-none">

      <div className='overflow-hidden h-full flex flex-col'>

        {(!simLoaded) && 
        <div className="flex flex-col w-[100vw] h-full bg-white absolute z-[50] justify-center items-center">
          <p>Loading...</p>
          <p>{loadProgress}%</p>
        </div>}

        <div className="flex flex-col pointer-events-auto">
          <div className="h-[60px] flex items-center bg-gradient-to-b from-emerald-900 to-emerald-800 text-white">
            <div className="flex justify-between w-[80%] m-auto">
            
              <h1 className='text-[30px] font-bold font-serif w-[80%]'>CFDWebProject</h1>
              <div className="flex justify-around items-center flex-grow">
                  <svg className='h-5 w-5 cursor-pointer' stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  <svg onClick={()=>setMenuVisible(!menuVisible)} className='h-7 w-7 cursor-pointer' stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M8 6C8 7.10457 7.10457 8 6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6Z" fill="currentColor"></path><path d="M8 12C8 13.1046 7.10457 14 6 14C4.89543 14 4 13.1046 4 12C4 10.8954 4.89543 10 6 10C7.10457 10 8 10.8954 8 12Z" fill="currentColor"></path><path d="M6 20C7.10457 20 8 19.1046 8 18C8 16.8954 7.10457 16 6 16C4.89543 16 4 16.8954 4 18C4 19.1046 4.89543 20 6 20Z" fill="currentColor"></path><path d="M14 6C14 7.10457 13.1046 8 12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6Z" fill="currentColor"></path><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor"></path><path d="M14 18C14 19.1046 13.1046 20 12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18Z" fill="currentColor"></path><path d="M18 8C19.1046 8 20 7.10457 20 6C20 4.89543 19.1046 4 18 4C16.8954 4 16 4.89543 16 6C16 7.10457 16.8954 8 18 8Z" fill="currentColor"></path><path d="M20 12C20 13.1046 19.1046 14 18 14C16.8954 14 16 13.1046 16 12C16 10.8954 16.8954 10 18 10C19.1046 10 20 10.8954 20 12Z" fill="currentColor"></path><path d="M18 20C19.1046 20 20 19.1046 20 18C20 16.8954 19.1046 16 18 16C16.8954 16 16 16.8954 16 18C16 19.1046 16.8954 20 18 20Z" fill="currentColor"></path></svg>
                  <svg onClick={() => navigate(`/teacher/${teacherid}`)} className="h-5 w-5 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 10v-2h-5v-2h5v-2l3 3zM11 9v4h-5v3l-6-3v-13h11v5h-1v-4h-8l4 2v9h4v-3z"></path><title>Exit without saving</title></svg>
              </div>
            </div>
          </div>

          
          <div className="h-[60px] py-1 px-2 flex justify-evenly items-center w-full bg-black border-y border-emerald-100">
            <div className="text-emerald-100">
              <h5>A simulation test</h5>
            </div>
            
            {simLoaded &&
              <div className="">
                <Selection selectedItem={activeField} onChangeFn={(item:string) => setActiveField(item)} allItems={selectedFields!} thisItem="Select Field..." />
              </div>
            }

            <div className="h-7 w-12 border border-emerald-100 flex items-center justify-around rounded-sm">
              <svg className="fill-emerald-100 h-5 w-5 border-r flex-1 border-emerald-100" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.5 3.5A.5.5 0 004 4v8a.5.5 0 001 0V4a.5.5 0 00-.5-.5z" clipRule="evenodd"></path><path fillRule="evenodd" d="M5.696 8L11.5 4.633v6.734L5.696 8zm-.792-.696a.802.802 0 000 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L4.904 7.304z" clipRule="evenodd"></path></svg>
              
              {(!playing) ? <svg onClick={playClicked} className="flex-1 h-5 w-5 fill-emerald-100" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 010 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" clipRule="evenodd"></path></svg>
              : <svg onClick={stopClicked} className="flex-1 h-5 w-5 fill-emerald-100" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3.5 5A1.5 1.5 0 015 3.5h6A1.5 1.5 0 0112.5 5v6a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 11V5zM5 4.5a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V5a.5.5 0 00-.5-.5H5z" clipRule="evenodd"></path></svg>
              }

            </div>

          </div>
        </div>

      </div>

      {(menuVisible) &&
      <div className="h-[calc(100%-120px)] pointer-events-auto overflow-y-hidden flex flex-col min-w-[300px] w-[20vw] right-0 top-[120px] bg-white absolute z-[2] bg-opacity-95 px-4 py-2">
        
        <div className="flex space-x-4 pb-2 mb-2 border-b border-emerald-600">
          <div className={`${menuTab === "General" && "border-b-[3px] border-emerald-600"} cursor-pointer`} onClick={() => setMenuTab("General")}>General</div>
          <div className={`${menuTab === "Notes" && "border-b-[3px] border-emerald-600"} cursor-pointer`} onClick={() => setMenuTab("Notes")}>Notes</div>
          <div className={`${menuTab === "Calculator" && "border-b-[3px] border-emerald-600"} cursor-pointer`} onClick={() => setMenuTab("Calculator")}>Calc</div>
        </div>

        <div className="flex flex-col justify-between flex-1 h-0 pb-1">
          
        {menuTab === "General" &&
          <div className="flex flex-col space-y-3">
              
              <div className="flex flex-col w-full space-y-2">
                  <div className="border-b border-emerald-600 flex-col">
                      <h4 className="font-semibold">Select fields:</h4>
                      <MultiSelection selectedItems={selectedFields!} setSelectedItems={setSelectedFields} allItems={fields} />
                  </div>
              </div>
          </div>
        }
        {
          menuTab === "Notes" &&
          <div className="overflow-y-auto mb-2 h-full w-full">
            <div className="w-full flex flex-col items-center px-4">
              <h5 className="font-semibold">My widgets</h5>
              {widgets.length === 0 && <p className="text-[13px] mt-2">No widgets added</p>}
              <div className='flex flex-col space-y-1 mb-2 pb-2 w-full'>{widgets.map((widget) => (
                  <ListedWidget widget={widget} widgets={widgets} setWidgets={setWidgets} />
              ))}
            </div>

            </div>

            <div className="flex flex-col items-center border-y border-emerald-600 py-2 space-y-2 px-4">
              <h5 className="font-semibold">Add widget</h5>
              <CustomInput labelText="Title" onChange={(e:React.ChangeEvent<HTMLInputElement>) => {setTitleInput(e.target.value)}} currentValue={titleInput} />
              <CustomTextArea labelText="Description" onChange={(e:React.ChangeEvent<HTMLInputElement>) => {setDescriptionArea(e.target.value)}} currentValue={descriptionArea} />
              <div className="flex pt-2 items-center">
                <h5 className="text-[15px]">Camera focus:</h5>
                <p onClick={setCameraToSaved} className={`${cam ? "bg-emerald-200" : "bg-gray-200"} px-2 rounded-md ml-1`}>{cam ? "Set" : "Default"}</p>
                <svg onClick={saveCamera} className="h-5 w-5 ml-2 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 3h2v2H3V3zm4 0h2v2H7V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm0 4h2v2h-2V7zM3 19h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3V7zm7.667 4l1.036-1.555A1 1 0 0 1 12.535 9h2.93a1 1 0 0 1 .832.445L17.333 11H20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2.667zM9 19h10v-6h-2.737l-1.333-2h-1.86l-1.333 2H9v6zm5-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></g><title>Set current view as focus</title></svg>
                <svg onClick={() => setCam(null)} className="h-[17px] w-[17px] ml-1 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,16c1.671,0,3-1.331,3-3s-1.329-3-3-3s-3,1.331-3,3S10.329,16,12,16z"></path><path d="M20.817,11.186c-0.12-0.583-0.297-1.151-0.525-1.688c-0.225-0.532-0.504-1.046-0.83-1.531 c-0.324-0.479-0.693-0.926-1.098-1.329c-0.404-0.406-0.853-0.776-1.332-1.101c-0.483-0.326-0.998-0.604-1.528-0.829 c-0.538-0.229-1.106-0.405-1.691-0.526c-0.6-0.123-1.219-0.182-1.838-0.18V2L8,5l3.975,3V6.002C12.459,6,12.943,6.046,13.41,6.142 c0.454,0.094,0.896,0.231,1.314,0.409c0.413,0.174,0.813,0.392,1.188,0.644c0.373,0.252,0.722,0.54,1.038,0.857 c0.315,0.314,0.604,0.663,0.854,1.035c0.254,0.376,0.471,0.776,0.646,1.191c0.178,0.417,0.314,0.859,0.408,1.311 C18.952,12.048,19,12.523,19,13s-0.048,0.952-0.142,1.41c-0.094,0.454-0.23,0.896-0.408,1.315 c-0.175,0.413-0.392,0.813-0.644,1.188c-0.253,0.373-0.542,0.722-0.858,1.039c-0.315,0.316-0.663,0.603-1.036,0.854 c-0.372,0.251-0.771,0.468-1.189,0.645c-0.417,0.177-0.858,0.314-1.311,0.408c-0.92,0.188-1.906,0.188-2.822,0 c-0.454-0.094-0.896-0.231-1.314-0.409c-0.416-0.176-0.815-0.393-1.189-0.645c-0.371-0.25-0.719-0.538-1.035-0.854 c-0.315-0.316-0.604-0.665-0.855-1.036c-0.254-0.376-0.471-0.776-0.646-1.19c-0.178-0.418-0.314-0.86-0.408-1.312 C5.048,13.952,5,13.477,5,13H3c0,0.611,0.062,1.221,0.183,1.814c0.12,0.582,0.297,1.15,0.525,1.689 c0.225,0.532,0.504,1.046,0.831,1.531c0.323,0.477,0.692,0.924,1.097,1.329c0.406,0.407,0.854,0.777,1.331,1.099 c0.479,0.325,0.994,0.604,1.529,0.83c0.538,0.229,1.106,0.405,1.691,0.526C10.779,21.938,11.389,22,12,22s1.221-0.062,1.814-0.183 c0.583-0.121,1.151-0.297,1.688-0.525c0.537-0.227,1.052-0.506,1.53-0.83c0.478-0.322,0.926-0.692,1.331-1.099 c0.405-0.405,0.774-0.853,1.1-1.332c0.325-0.483,0.604-0.998,0.829-1.528c0.229-0.54,0.405-1.108,0.525-1.692 C20.938,14.221,21,13.611,21,13S20.938,11.779,20.817,11.186z"></path><title>Restore to default</title></svg>
              </div>

              <div className="flex space-x-1 w-full pt-2">
                <ButtonDarkMid btnText="Reset" onClickFn={addWidget} fullWidth={true} />
                <ButtonDarkMid btnText="Add widget" onClickFn={addWidget} fullWidth={true} />
              </div>
            </div>
          </div>
        }
        {menuTab === "Calculator" &&
          <div className="flex flex-col space-y-3">
              
              <div className="flex flex-col w-full space-y-2">
                  <ButtonDarkMid btnText="calculate" fullWidth={false} onClickFn={calculateClicked} />
              </div>
          </div>
        }
        
          <div className="flex space-x-1">
            <ButtonDark btnText="Cancel" onClickFn={saveCamera} fullWidth={true} />
            <ButtonDark btnText="Save changes" onClickFn={saveChanges} fullWidth={true} />
          </div>
        </div>
        
      </div>
      }
    </div>
    </>
  );
}

export default TeacherView;
