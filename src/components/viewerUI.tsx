import { useContext, useEffect, useRef, useState } from 'react';

import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';


import {
  ColorMode,
  ScalarMode,
} from '@kitware/vtk.js/Rendering/Core/Mapper/Constants';

import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkLookupTable from '@kitware/vtk.js/Common/Core/LookupTable';

import { Link } from 'react-router-dom';

import { IVTKContext, IWidget } from '../types';
import Draggable from 'react-draggable';
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera';
import SelectionSmaller from './uiComponents/selectionSmaller';
import { UIContext } from '../pages/studentView';
import useInterval from '../hooks/useInterval';
import { vtkjsHelper } from '../helpers/vtkjsHelper';
import WidgetCard from './widgetCard';


const representationEnum : {[key:string] : number} = {
  "Points": 0,
  "Wireframe":1,
  "Surface": 2,
  "Surface with edge":2
}


export const colorSchemes : {[key:string] : string} = {
  "Jet": "jet",
  "Cool to Warm": "Cool to Warm",
  "Grayscale": "Grayscale"
}


const ViewerUI = ({vtkContext} : {vtkContext:React.MutableRefObject<IVTKContext | null>}) => {

  const { notes, setNotes, visibleFields, setVisibleFields, simName, setSimLoaded, customOptionsContext } = useContext(UIContext);

  const nodeRef = useRef<any>(null);

  const [optionsVisible, setOptionsVisible] = useState<boolean>(true);
  const [baseVisible, setBaseVisible] = useState<boolean>(false);
  const [helpActive, setHelpActive] = useState<boolean>(false);

  const [activeTimeStep, setActiveTimeStep] = useState<number>(0);


  const [activeField, setActiveField] = useState<string | null>("Solid color");

  const [activecolorScheme, setActiveColorScheme] = useState<string | null>("Jet");


  const [playing, setPlaying] = useState<boolean>(false);
  const [looping, setLooping] = useState<boolean>(false);

  const [noteMenuVisible, setNoteMenuVisible] = useState<boolean>(false);

  const [widgetOpen, setWidgetOpen] = useState<boolean>(false);
  const [currentWidget, setCurrentWidget] = useState<number | null>(null);

  const representations = ["Surface", "Surface with edge", "Points", "Wireframe"];
  const [activeRepresentation, setActiveRepresentation] = useState<string | null>("Surface");

  const [colorNodes, setColorNodes] = useState<any>([]);
  const [range, setRange] = useState<[number, number] | null>(null);


  const rangeRef = useRef<[number, number] | null>(null);

  const loadTeacherOptions = () => {

    if (!customOptionsContext) return;

    const { renderer, renderWindow } = vtkContext.current!;
  
    const defaultSource = vtkContext.current!.allData[0];
    const teacherOptions = customOptionsContext!.teacherOptions;

    //Apply field restrictions if they are applied
    if (teacherOptions && teacherOptions.restrictFields && teacherOptions.restrictFields.length > 0) {
      setVisibleFields(teacherOptions.restrictFields);
    } else {
      const allPointFields = defaultSource.getPointData().getArrays().map((ar:vtkDataArray)=> "(p) " + ar.getName());
      const allCellFields = defaultSource.getCellData().getArrays().map((ar:vtkDataArray)=> "(c) " + ar.getName());
      
      setVisibleFields(["Solid color", ...allPointFields, ...allCellFields]);
    }

    if (customOptionsContext!.notes) setNotes(customOptionsContext!.notes!);
    
    if (teacherOptions?.startingField) {
      changeField(teacherOptions.startingField);
    }

    if (teacherOptions.startingPreset) changeColorScheme(teacherOptions.startingPreset);

    if (teacherOptions.controllerHidden) setOptionsVisible(false);

    if (teacherOptions.noteShown === true && customOptionsContext.notes && customOptionsContext.notes.length > 0) {
      openNote(0);
    };

    setCurrentWidget(0);
    setSimLoaded(true);
    
    if (teacherOptions.startingCamera) {
      const newCamera :vtkCamera = vtkCamera.newInstance(teacherOptions.startingCamera);
      renderer!.setActiveCamera(newCamera);
      renderWindow?.render();
    }

  }

  useEffect(() => {

    // loading the custom options
    if (!customOptionsContext) return;

    loadTeacherOptions();
  }, [customOptionsContext]);


  //A small black line may appear when hiding the note bar. This useEffect fixes it.
  useEffect(() => {
    if (!vtkContext.current) return;

    if (vtkContext.current.renderWindow) {
      vtkContext.current.renderWindow.render();
    }

  }, [noteMenuVisible])


  const changeField = async (str:string) => {

    if (!vtkContext.current) return;

    const { mapper, renderWindow, allData, sceneImporter, lookupTable } : IVTKContext = vtkContext.current;


    if (str === "Solid color") {
      setActiveField(str)
      mapper?.set({
      scalarVisibility: false,
      });

      renderWindow?.render();
      return;
    }

    let source;
    if (sceneImporter) source = sceneImporter.getScene()[0].source.getOutputData();
    else source = allData[activeTimeStep];

    //const scalarsArray : vtkDataArray[] = source.getPointData().getArrays();

    const newField = str.slice(4);
    const dataArray : vtkDataArray = str.startsWith("(p) ") ? source.getPointData().getArrayByName(newField) : str.startsWith("(c) ") && source.getCellData().getArrayByName(newField);
    
    
    const dataRange = dataArray.getRange();

    let scalarMode = str.startsWith("(p) ") ? ScalarMode.USE_POINT_FIELD_DATA : str.startsWith("(c) ") && ScalarMode.USE_CELL_FIELD_DATA;
    let colorMode = ColorMode.MAP_SCALARS;
    
    const preset = vtkColorMaps.getPresetByName(colorSchemes[activecolorScheme!]);
    
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

    renderWindow?.render();
    
    setColorNodes(mapper?.getLookupTable().get().nodes);
    setRange(dataRange);

    rangeRef.current = dataRange;

    setActiveField(str);

  }

  const changeRepresentation = (str:string) => {
    if (!vtkContext.current) return;

    const { actor, renderWindow } = vtkContext.current!;

    console.log(representationEnum[str]);
    

    actor!.getProperty().setRepresentation(representationEnum[str]);
    
    
    if (str === "Surface with edge") actor!.getProperty().setEdgeVisibility(true);
    else actor!.getProperty().setEdgeVisibility(false);

    renderWindow?.render();
    setActiveRepresentation(str);
  }

  const changeColorScheme = (str:string) => {

    if (!vtkContext.current) return;

    const { mapper, renderWindow } = vtkContext.current!;

    
    const preset = vtkColorMaps.getPresetByName(colorSchemes[str]);

    const lut = mapper?.getLookupTable();
    lut.applyColorMap(preset);

    if (rangeRef.current) lut.setMappingRange(rangeRef.current![0], rangeRef.current![1]);
    lut.updateRange();

    renderWindow?.render();

    setColorNodes(mapper?.getLookupTable().get().nodes);
    setActiveColorScheme(str);

  }


  //Time step handling
  const getTimeStepCount = () => {

    if (!vtkContext.current) return;

    const { sceneImporter, allData } = vtkContext.current!;

    if (sceneImporter) return sceneImporter.getAnimationHandler().getTimeSteps().length;

    else return allData.length;
  }

  const changeTimeStep = (newTimestep:number) => {
    const { mapper, renderWindow, allData, sceneImporter } : IVTKContext = vtkContext.current!;

    let source;

    //handle for vtkjs
    if (sceneImporter) {
      source = vtkjsHelper.applyStep(newTimestep, sceneImporter);
    }

    else {
      //for vtp
      source = allData[newTimestep];
    }

    const dataArray : vtkDataArray = activeField!.startsWith("(p) ") ? source.getPointData().getArrayByName(activeField?.slice(4)) : activeField!.startsWith("(c) ") && source.getCellData().getArrayByName(activeField?.slice(4));
    const dataRange = dataArray.getRange();

    const lut = mapper?.getLookupTable();
    lut.setMappingRange(dataRange![0], dataRange![1]);
    lut.updateRange();

    setRange(dataRange);
    rangeRef.current = dataRange;

    setActiveTimeStep(newTimestep);
    mapper?.setInputData(source);  
    renderWindow?.render();
  }
  
  const advanceTime = () => {
    
    let newTimestep = 0;
    const timestepCount = getTimeStepCount();


    if (activeTimeStep < timestepCount-1) newTimestep = activeTimeStep + 1;

    if (looping && activeTimeStep >= timestepCount-1) newTimestep = 0;
    
    if (!looping && activeTimeStep >= timestepCount-1) {
      setPlaying(false);
      return;
    }

    changeTimeStep(newTimestep);
  }

  const playClicked = () => {
    if (activeTimeStep >= getTimeStepCount()-1) {
      changeTimeStep(0);
    }
    
    setPlaying(true);
  }

  const stopClicked = () => {
    setPlaying(false);
    window.clearInterval(intervalRef.current);
  }

  //time interval handler hook
  const intervalRef = useInterval(advanceTime, playing ? 100 : null);



  //Note handling
  const openNote = (widgetNr:number) => {
    setWidgetOpen(true);
    setCurrentWidget(widgetNr);
      
  }

  useEffect(() => {
    
    if (!currentWidget) return;

    const { renderer, renderWindow } : IVTKContext = vtkContext.current!;
    
    const widget : IWidget = notes[currentWidget];
    
    //Check if a custom camera position is set for the note
    if (widget.camera) {
      const newCamera :vtkCamera = vtkCamera.newInstance(widget.camera!);
      renderer!.setActiveCamera(newCamera);
      renderWindow?.render();
    }
  }, [currentWidget]);


  //Number formatting
  const getRangeInFormat = (nr:number) => {

    if (nr < 1000 && nr > 0.01) return nr.toFixed(2);

    if (nr === 0) return nr;

    else return nr.toExponential(2);
  }



  return (
    <>
    {/* Displaying the note */}
    {(widgetOpen && notes && notes.length > 0)  &&
    <div className="h-full w-full absolute z-[8] overflow-hidden pointer-events-none flex justify-end items-end p-4">
      <Draggable handle=".widgetHandle" bounds="body" nodeRef={nodeRef}>
        <div ref={nodeRef} className=" w-[340px] sm:w-[370px] h-[220px] bg-white bg-opacity-95 border-2 border-emerald-900 shadow-lg shadow-black rounded-md pointer-events-auto">
          <WidgetCard widgets={notes} currentWidgetNr={currentWidget!} changeWidgetFn={openNote} setWidgetOpen={setWidgetOpen} />
        </div>
      </Draggable>
    </div>
    }


    {/* Default overlay */}
    <div className="absolute z-[3] h-full w-full pointer-events-none flex justify-between">

      {/* Left bar */}
      <div className="flex items-end sm:items-center h-full py-2">
        {optionsVisible &&
        <div className="fade-in-card-fast max-h-full overflow-auto bg-black bg-opacity-90 w-[230px] sm:w-[250px] ml-1 sm:ml-4 py-2 sm:py-4 px-2 sm:px-5 text-white flex flex-col pointer-events-auto rounded-md border border-emerald-900 shadow-lg shadow-black overflow-y-auto">
          <div className="flex justify-between pb-1 border-b-2">
            <h3 className="text-[15px] sm:text-[17px]">Controller</h3>
            <svg onClick={() => setOptionsVisible(false)} className="w-2 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 352H48c-26.5 0-48 21.5-48 48v32c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-32c0-26.5-21.5-48-48-48z"></path></svg>
          </div>
          
          <div className="flex flex-col text-[13px] px-3">

            {visibleFields && visibleFields!.length > 0 &&
            <div className="flex flex-col space-y-1 pb-3 pt-1.5 border-b">
              <h5>Field</h5>
              <div className="flex justify-center">
                <SelectionSmaller selectedItem={activeField} onChangeFn={changeField} allItems={visibleFields!} thisItem={null} />
              </div>
            </div>
            }

            <div className="flex flex-col space-y-1 pb-3 pt-1.5 border-b">
              <h5>Representation</h5>
              <div className="flex justify-center">
                <SelectionSmaller selectedItem={activeRepresentation} onChangeFn={changeRepresentation} allItems={representations} thisItem={null} fullWidth={true} />
              </div>
            </div>

            {getTimeStepCount() > 1 &&
            <div className="flex flex-col space-y-1 pb-3 pt-1.5 border-b">
              <h5>Play</h5>
              <div className="flex justify-evenly items-center">
                <div className="text-[13px]">{activeTimeStep + 1}/{getTimeStepCount()}</div>
                {!playing ?
                  <svg onClick={playClicked} className="h-[20px] w-[20px] fill-white cursor-pointer active:fill-emerald-500" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.804 8L5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 010 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" clipRule="evenodd"></path></svg>
                  :
                  <svg onClick={stopClicked} className="h-[18px] w-[20px] fill-emerald-500 cursor-pointer active:fill-emerald-500" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z"></path></svg>
                }
                
                
                <svg onClick={() => changeTimeStep(0)} className="active:fill-emerald-500 h-[20px] w-[20px] cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.5 3.5A.5.5 0 004 4v8a.5.5 0 001 0V4a.5.5 0 00-.5-.5z" clipRule="evenodd"></path><path fillRule="evenodd" d="M5.696 8L11.5 4.633v6.734L5.696 8zm-.792-.696a.802.802 0 000 1.392l6.363 3.692c.52.302 1.233-.043 1.233-.696V4.308c0-.653-.713-.998-1.233-.696L4.904 7.304z" clipRule="evenodd"></path></svg>
              
                <svg onClick={() => setLooping(!looping)} className={`${looping && "fill-emerald-500"} h-[12px] w-[12px] cursor-pointer active:fill-emerald-500`} stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13.901 2.599c-1.463-1.597-3.565-2.599-5.901-2.599-4.418 0-8 3.582-8 8h1.5c0-3.59 2.91-6.5 6.5-6.5 1.922 0 3.649 0.835 4.839 2.161l-2.339 2.339h5.5v-5.5l-2.099 2.099z"></path><path d="M14.5 8c0 3.59-2.91 6.5-6.5 6.5-1.922 0-3.649-0.835-4.839-2.161l2.339-2.339h-5.5v5.5l2.099-2.099c1.463 1.597 3.565 2.599 5.901 2.599 4.418 0 8-3.582 8-8h-1.5z"></path></svg>

              </div>
            </div>
            }

            {/* Color scale */}
            <div className={`flex flex-col space-y-1 pb-3 pt-1.5 border-b ${activeField === "Solid color" && "invisible"}`}>
              <h5>Colors</h5>

              <div className="flex flex-col items-center space-y-1 sm:space-y-3">
                <SelectionSmaller selectedItem={activecolorScheme} onChangeFn={changeColorScheme} allItems={Object.keys(colorSchemes)} thisItem={null} fullWidth={true} />

                <div className="flex flex-col space-y-0.5 w-full px-6">
                  {range &&
                  <div className='flex justify-between w-full text-[12px]'>
                      <p>{getRangeInFormat(range[0])}</p>
                      <p>{getRangeInFormat(range[1])}</p>
                  </div>
                  }

                  <div className="flex h-4 w-full">
                    {colorNodes.map((node:any, idx:number) => 
                      idx > 0 && 
                      <div key={idx} style={{backgroundImage: `linear-gradient(to right, rgb(${colorNodes[idx-1].r * 255}, ${colorNodes[idx-1].g * 255}, ${colorNodes[idx-1].b * 255}), rgb(${node.r * 255}, ${node.g * 255}, ${node.b * 255}))`}} className="flex-1"> 
                      </div>  
                    )}
                  </div>

                  <p className="w-full px-2 text-[13px]">{activeField?.slice(4)}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
        }
      </div>

      {/* Right toolbar */}
      <div className="flex items-end sm:items-center pb-4 pr-4">

        <div className="flex flex-col border border-emerald-900 bg-black bg-opacity-90 px-2 rounded-md pointer-events-auto shadow-lg shadow-black">
          
          <div className="w-full flex justify-center border-b border-white py-[5px] relative">
            <div onClick={() => setBaseVisible(!baseVisible)} className={`${baseVisible && "bg-emerald-900 py-1 px-0.5 rounded-[3px]"} flex justify-center w-full`}>
              <svg onClick={() => {}} className="h-fit w-[22px] cursor-pointer" width="96.842262" height="66.654274" viewBox="0 0 25.622848 17.635614" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg"><defs id="defs2" /><g id="layer1" transform="translate(38.806065,-38.848404)"><path fill='#ffffff' fillOpacity={1} strokeWidth={0.401544} d="m -37.742856,40.007935 c 0,0 15.205213,0.45785 16.385326,0.717343 3.277745,0.608063 7.408092,2.111077 7.445954,7.772802 -0.01445,4.408155 -5.083806,7.161218 -5.083806,7.161218 l -9.602065,-8.328321 c 0,0 0.326617,-1.68073 -1.097196,-3.017052 -1.423814,-1.336323 -3.554317,-1.017424 -3.554317,-1.017424 z" id="path12136" /></g></svg>
            </div>

            {baseVisible &&
              <div className="absolute z-10 right-10 top-[-12px] flex flex-col space-y-1 items-end pointer-events-none text-[14px]">      
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
            <div onClick={() => widgetOpen ? setWidgetOpen(false) : openNote(!currentWidget ? 0 : currentWidget)} className={`${widgetOpen && "bg-emerald-900 p-0.5 rounded-[3px]"} flex justify-center w-full`}>
              <svg onClick={() => {}} className="h-[22px] w-[22px] fill-white cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm416 0H627.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path></svg>
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
      <h2 className="text-white text-[16px] sm:text-[20px] ml-5 mt-3 no_selection">{simName}</h2>
    </div>


    {/* Note list */}
    {(noteMenuVisible && notes.length > 0) && 
    <div className="absolute z-[2] top-0 right-0 h-full w-full flex justify-end pointer-events-none">
      <div className="bg-white bg-opacity-95 px-3 py-2 min-w-[250px] max-w-[90%] sm:max-w-[400px] fade-in-card-fast pointer-events-auto">
        <div className="w-full">
          <div className= "border-b-2 w-full">Notes</div>
        </div>

        <div className="flex flex-col justify-between flex-1 h-0 py-1">
          
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
      
    </>
  );
}

export default ViewerUI;
