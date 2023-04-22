
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Volume';

import { useContext, useEffect, useRef, useState } from 'react'
import { ICustomOptions, IFileObject, IVTIContext, IWidget } from '../types';
import { fileService } from '../services/fileService';
import { Link, useParams } from 'react-router-dom';
import ViewerLoadingScreen from './viewerLoadingScreen';
import { VtiUIContext } from '../pages/vtiStudentView';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';

import JSZip from 'jszip';
import VolumeControl from '../widgets/VolumeController/volumeControl';
import vtkVolumeController from '../widgets/VolumeController'

import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import SelectionSmaller from './uiComponents/selectionSmaller';
import ToggleSwitch from './toggleSwitch';
import Range from './uiComponents/range';
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera';
import Draggable from 'react-draggable';
import WidgetCard from './widgetCard';
import { useMediaQuery } from 'react-responsive';


const colorSchemes : {[key:string] : string} = {
  "Rainbow": "erdc_rainbow_bright",
  "Cool to Warm": "Cool to Warm",
  "Grayscale": "Grayscale"
}

const createVtiViewer = async (vtiContainerRef:React.MutableRefObject<HTMLDivElement | null>, vtiContext: React.MutableRefObject<IVTIContext | null>, widgetRef:React.MutableRefObject<HTMLDivElement | null>, file:File, isMobile:boolean) => {
  const fullScreenRenderWindow = (vtkFullScreenRenderWindow as any).newInstance({
      background: [0.04, 0.04, 0.04],
      rootContainer: vtiContainerRef.current,
  });

  const renderer = fullScreenRenderWindow.getRenderer();
  const renderWindow = fullScreenRenderWindow.getRenderWindow();

  const jszip = new JSZip();

  const zip = await jszip.loadAsync(file);

  if (!zip.files) return;

  const fileNameArray = [];

  for (__filename in zip.files) {
    fileNameArray.push(__filename);
  }

  const fileData = await zip.files[fileNameArray[0]].async('arraybuffer');

  const vtiReader = vtkXMLImageDataReader.newInstance();
  vtiReader.parseAsArrayBuffer(fileData);

  const source = vtiReader.getOutputData(0);

  const mapper = vtkVolumeMapper.newInstance();
  const actor = vtkVolume.newInstance();

  const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();

  const lookupTable = vtkColorTransferFunction.newInstance();
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();

  // Pipeline handling
  actor.setMapper(mapper);
  mapper.setInputData(source);
  renderer.addActor(actor);

  // Configuration
  const sampleDistance =
      0.7 *
      Math.sqrt(
      source
          .getSpacing()
          .map((v:any) => v * v)
          .reduce((a:any, b:any) => a + b, 0)
      );
  mapper.setSampleDistance(sampleDistance);
  actor.getProperty().setRGBTransferFunction(0, lookupTable);
  actor.getProperty().setScalarOpacity(0, piecewiseFunction);
  // actor.getProperty().setInterpolationTypeToFastLinear();
  actor.getProperty().setInterpolationTypeToLinear();

  // For better looking volume rendering
  // - distance in world coordinates a scalar opacity of 1.0
  actor
      .getProperty()
      .setScalarOpacityUnitDistance(
      0,
      vtkBoundingBox.getDiagonalLength(source.getBounds()) /
          Math.max(...source.getDimensions())
      );
  // - control how we emphasize surface boundaries
  //  => max should be around the average gradient magnitude for the
  //     volume or maybe average plus one std dev of the gradient magnitude
  //     (adjusted for spacing, this is a world coordinate gradient, not a
  //     pixel gradient)
  //  => max hack: (dataRange[1] - dataRange[0]) * 0.05
  actor.getProperty().setGradientOpacityMinimumValue(0, 0);
  actor
      .getProperty()
      .setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
  // - Use shading based on gradient
  actor.getProperty().setShade(true);
  actor.getProperty().setUseGradientOpacity(0, true);
  // - generic good default
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);

  
  const widgetSize = !isMobile ? [300,150] : [200,120]


  const controllerWidget = vtkVolumeController.newInstance({
    size: widgetSize,
    rescaleColorMap: true,
  });

  const isBackgroundDark = true;
  controllerWidget.setContainer(widgetRef.current);
  controllerWidget.setupContent(renderWindow, actor, isBackgroundDark);

  //controllerWidget.updatePreset(colorSchemes["Rainbow"]);


  fullScreenRenderWindow.setResizeCallback(({ width, height } : {width:any, height:any}) => {
    // 2px padding + 2x1px boder + 5px edge = 14

    if (width < 100) {
      controllerWidget.setSize(100, 50);
      controllerWidget.render();
      return;
    } 

    if (width > 360) {
      controllerWidget.setSize(widgetSize[0], widgetSize[1]);
    } else {
      controllerWidget.setSize(width - 100, widgetSize[1]);
    }
    controllerWidget.render();
  });

  // First render
  renderer.resetCamera();
  renderWindow.render();


  vtiContext.current = {
    renderWindow,
    renderer,
    controllerWidget,
    fullScreenRenderer: fullScreenRenderWindow
  }
}



const VtiViewer = ({vtiContext, customOptionsContext, onLoadSuccess} : {vtiContext:React.MutableRefObject<IVTIContext | null>, customOptionsContext:React.MutableRefObject<ICustomOptions | null>, onLoadSuccess:Function}) => {

  const { notes, setNotes, simLoaded } = useContext(VtiUIContext);
      
  const hasEnded = useRef<boolean>(false);

  const vtiContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = useRef<any>(null);

  const startEffectRun = useRef<boolean>(false);

  const [loadProgress, setLoadProgress] = useState<number>(0);
  
  const { simid } = useParams();

  const [activecolorScheme, setActiveColorScheme] = useState<string | null>("Rainbow");
  const [shadowActive, setShadowActive] = useState<boolean>(true);
  const [spacing, setSpacing] = useState<number>(0.4);
  const [edge, setEdge] = useState<number>(0.2);

  const [noteMenuVisible, setNoteMenuVisible] = useState<boolean>(false);

  const [widgetOpen, setWidgetOpen] = useState<boolean>(false);
  const [currentWidget, setCurrentWidget] = useState<number>(0);

  const [optionsVisible, setOptionsVisible] = useState<boolean>(true);
  const [baseVisible, setBaseVisible] = useState<boolean>(false);
  const [helpActive, setHelpActive] = useState<boolean>(false);

  const isMobile = useMediaQuery({ query: `(max-width: 640px)` });

  const [simName, setSimName] = useState<string>();


  const load = async () => {

      const fileObject : IFileObject = await fileService.getFile(simid!, setLoadProgress);
      customOptionsContext.current = {notes:fileObject.notes, teacherOptions:fileObject.teacher_options}
      setNotes(fileObject.notes);
      setSimName(fileObject.simName);

      //I want to stop execution if the user goes back while loading the simulation
      if (hasEnded.current) return;
      
      await createVtiViewer(vtiContainerRef, vtiContext, widgetRef, fileObject.file, isMobile);
      //Clean up if the user goes back after file is loaded and viewer is loading
      if (hasEnded.current) {
      //cleanup();
      return;
      }

      onLoadSuccess();
  }

  useEffect(() => {
      if (!startEffectRun.current) {
          load();
      }

      return () => {
      if (!(process.env.NODE_ENV === "development")) {
          hasEnded.current = true;
      }

      if (startEffectRun.current) {
          hasEnded.current = true;
      }

      startEffectRun.current = true
      }
  }, []);

  useEffect(() => {
    if (!vtiContext.current) return;

    if (vtiContext.current.renderWindow) {
      vtiContext.current.renderWindow.render();
    }

  }, [noteMenuVisible])

  const presetChanged = (str:string) => {

    const { controllerWidget } = vtiContext.current!;

    controllerWidget.updatePreset(colorSchemes[str]);
    
    setActiveColorScheme(str);
  }

  const ShadowChanged = () => {
    const newValue = !shadowActive;

    if (!vtiContext.current) return;

    const { controllerWidget } = vtiContext.current;

    controllerWidget.updateShadow(newValue);
    setShadowActive(newValue);
    
  }

  const spacingChanged = (newValue:number) => {
    
    if (!vtiContext.current) return;

    const { controllerWidget } = vtiContext.current;

    controllerWidget.updateSpacing(newValue);
    setSpacing(newValue);
  }

  const edgeChanged = (newValue:number) => {

    if (!vtiContext.current) return;

    const { controllerWidget } = vtiContext.current;
    
    controllerWidget.updateEdgeGradient(newValue);
    setEdge(newValue);
  }

  //Note handling
  const openNote = (widgetNr:number) => {

    const { renderer, renderWindow } : IVTIContext = vtiContext.current!;
    
    const widget : IWidget = notes[widgetNr];

    if (!widgetOpen) setWidgetOpen(true);
    
    //Check if a custom camera position is set for the note
    if (widget.camera) {
      const newCamera :vtkCamera = vtkCamera.newInstance(widget.camera!);
      renderer!.setActiveCamera(newCamera);
      renderWindow?.render();
    }

    setCurrentWidget(widgetNr);
      
  }

  return (

      <>
      {(!simLoaded) &&
        <ViewerLoadingScreen loadProgress={loadProgress} />
      }

      {/* Displaying the note */}
      {widgetOpen &&
      <div className="h-full w-full absolute z-[8] overflow-hidden pointer-events-none flex justify-end items-end p-4">
        <Draggable handle=".widgetHandle" bounds="body" nodeRef={nodeRef}>
          <div ref={nodeRef} className=" w-[350px] h-[200px] bg-white bg-opacity-95 border-2 border-emerald-900 shadow-lg shadow-black rounded-md pointer-events-auto">
            <WidgetCard widgets={notes} currentWidgetNr={currentWidget} changeWidgetFn={openNote} setWidgetOpen={setWidgetOpen} />
          </div>
        </Draggable>
      </div>
      }
    

      <div className="w-full h-full absolute z-[8] overflow-hidden flex justify-between pointer-events-none">
        
        {/* Left bar */}
        <div className="flex items-center">
          <div className={`${!optionsVisible && "hidden"} fade-in-card-fast bg-black bg-opacity-90 ml-1 sm:ml-4 py-4 px-4 text-white flex flex-col pointer-events-auto rounded-md border border-emerald-900 shadow-lg shadow-black overflow-y-auto}`}>
            <div className="flex justify-between pb-1 border-b-2">
              <h3 className="text-[17px]">Controller</h3>
              <svg onClick={() => setOptionsVisible(false)} className="w-2 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 352H48c-26.5 0-48 21.5-48 48v32c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-32c0-26.5-21.5-48-48-48z"></path></svg>
            </div>

            <div className="flex flex-col text-[13px] px-2">

              <div className="flex flex-col space-y-1 pb-4 pt-1.5">
                <h5>Colors</h5>
                <div className="flex flex-col items-center space-y-2">
                  
                  <div className="flex w-full px-4 justify-between space-x-1 items-center">
                    <SelectionSmaller selectedItem={activecolorScheme} onChangeFn={presetChanged} allItems={Object.keys(colorSchemes)} thisItem={null} fullWidth={true} />
                    <ToggleSwitch isActive={shadowActive} onChangeFn={ShadowChanged} />
                  </div>

                  <div className="flex w-full justify-center sm:px-2">
                    <div ref={widgetRef}></div>
                  </div>

                  <div className="flex justify-between space-x-3 w-full">
                    <div className="flex-1"><Range value={spacing} onChangeFn={spacingChanged} text="Spacing" /></div>
                    <div className="flex-1"><Range value={edge} onChangeFn={edgeChanged} text="Edge gradient" /></div>
                  </div>

                </div>
              </div>
            
            </div>
            
          </div>
        </div>
        
        {/* Right toolbar */}
        <div className="flex items-center pr-4">

          <div className="flex flex-col border border-emerald-900 bg-black bg-opacity-90 px-2 rounded-md pointer-events-auto shadow-lg shadow-black">
            
            <div className="w-full flex justify-center border-b border-white py-[5px] relative">
              <div onClick={() => setBaseVisible(!baseVisible)} className={`${baseVisible && "bg-emerald-900 py-1 px-0.5 rounded-[3px]"} flex justify-center w-full`}>
                <svg onClick={() => {}} className="h-fit w-[22px] cursor-pointer" width="96.842262" height="66.654274" viewBox="0 0 25.622848 17.635614" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg"><defs id="defs2" /><g id="layer1" transform="translate(38.806065,-38.848404)"><path fill='#ffffff' fillOpacity={1} strokeWidth={0.401544} d="m -37.742856,40.007935 c 0,0 15.205213,0.45785 16.385326,0.717343 3.277745,0.608063 7.408092,2.111077 7.445954,7.772802 -0.01445,4.408155 -5.083806,7.161218 -5.083806,7.161218 l -9.602065,-8.328321 c 0,0 0.326617,-1.68073 -1.097196,-3.017052 -1.423814,-1.336323 -3.554317,-1.017424 -3.554317,-1.017424 z" id="path12136" /></g></svg>
              </div>

              {baseVisible &&
                <div className="absolute z-10 right-10 top-[-12px] flex flex-col space-y-1 items-end pointer-events-none text-[14px]">
                  <div onClick={() => setHelpActive(!helpActive)} className="bg-white px-1 py-0.5 border border-emerald-900 shadow-lg rounded-[3px] cursor-pointer w-fit pointer-events-auto">Help</div>
                  
                  <Link to="/">
                    <div className="bg-white px-1 py-0.5 border border-emerald-900 shadow-lg rounded-[3px] whitespace-nowrap cursor-pointer pointer-events-auto">
                      Return to Main Menu
                    </div>
                  </Link>
                </div>
              }
            </div>
            <div className="w-full border-white py-[5px] cursor-pointer">
              <div onClick={() => setOptionsVisible(!optionsVisible)} className={`${optionsVisible && "bg-emerald-900 p-0.5 rounded-[3px]"} flex justify-center w-full`}>
                <svg className="h-[22px] w-[22px] fill-white" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 7H3V2h1v5zm-1 7h1v-3H3v3zm5 0h1V8H8v6zm5 0h1v-2h-1v2zm1-12h-1v6h1V2zM9 2H8v2h1V2zM5 8H2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm5-3H7c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm5 4h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1z"></path></svg>  
              </div>
            </div>

            {notes && notes.length > 0 &&
            <>
            <div className="border-y border-white py-1 w-full flex justify-center">
              <div onClick={() => widgetOpen ? setWidgetOpen(false) : openNote(currentWidget)} className={`${widgetOpen && "bg-emerald-900 p-0.5 rounded-[3px]"} flex justify-center w-full`}>
                <svg className="h-[22px] w-[22px] fill-white cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm416 0H627.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path></svg>
              </div>
            </div>
            <div className="py-1 flex justify-center">
              <div onClick={() => setNoteMenuVisible(!noteMenuVisible)} className={`${noteMenuVisible && "bg-emerald-900 p-0.5 rounded-[3px]"} flex justify-center w-full`}>
                <svg className="h-[22px] w-[22px] stroke-white cursor-pointer" stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </div>
            </div>
            </>
            }

          </div>

        </div>
      </div>

      {/* Simulation title */}
      <div className="absolute z-[2] w-full pointer-events-none flex justify-center">
        <h2 className="text-white text-[20px] ml-5 mt-3 no_selection">{simName}</h2>
      </div>


      {/* Note list */}
      {(noteMenuVisible && notes.length > 0) && 
      <div className="absolute z-[2] top-0 right-0 h-full w-full flex justify-end pointer-events-none">
        <div className="bg-white bg-opacity-95 px-3 py-2 min-w-[250px] fade-in-card-fast pointer-events-auto">
          <div className="w-full">
            <div className= "border-b-2 w-full">Notes</div>
          </div>

          <div className="flex flex-col justify-between flex-1 h-0 pb-1">
            
            <div className="flex flex-col">
                {notes.map((note:IWidget, idx:number) => (
                  <div key={note.title + idx} className="flex flex-col justify-center space-y-2 border-2 p-2 bg-emerald-100 cursor-pointer rounded-md" onClick={() => openNote(idx)}>
                    {note.title && <h5 className="text-[15px] font-semibold">{note.title}</h5>}
                    {note.description && <p className="text-[13px]">{note.description}</p>}
                  </div>
                ))}
            </div>

          </div>
        </div>
      </div>
      }
      
      <div ref={vtiContainerRef}></div>

    </>
  );
}

export default VtiViewer;