// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

import JSZip from "jszip";

import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import { aTest } from '../pages/test';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import { ICustomOptions, IVTKContext } from '../types';


const createViewer = async (vtkContext:React.MutableRefObject<IVTKContext | null>, 
                            customOptionsContext:React.MutableRefObject<ICustomOptions | null>, 
                            vtkContainerRef:React.MutableRefObject<HTMLDivElement | null>,
                            file:File,
                            filetype:number) => {

    const { notes, teacherOptions } = customOptionsContext.current!;

    const fullScreenRenderWindow = (vtkFullScreenRenderWindow as any).newInstance({
        background: [0.04, 0.04, 0.04],
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
      // Setup an interactor to handle mouse events
      // ----------------------------------------------------------------------------
  
      const interactor = renderWindow.getInteractor();
  
      // ----------------------------------------------------------------------------
      // Setup interactor style to use
      // ----------------------------------------------------------------------------
  
      interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
      interactor.setDesiredUpdateRate(15);

    //if (teacherOptions.current) setSelectedFields(fileObject.teacher_options.restrictFields);


    const zipArrayBuffer = file

    let defaultSource;
    let timeSeriesData = null;
    let readRes = null;

    
    if (filetype === 1)
    {
      const jszip = new JSZip();

      const zip = await jszip.loadAsync(zipArrayBuffer);

      const fileNameArray = [];

      for (__filename in zip.files) {
        fileNameArray.push(__filename);
      }

      if (fileNameArray.length > 1) {

        fileNameArray.sort((a,b) => {
          const firstInt = ((a.slice(0,-4)).match(/\d+$/) || []).pop();
          const secondInt = ((b.slice(0,-4)).match(/\d+$/) || []).pop();
          return (parseInt(firstInt!) - parseInt(secondInt!));
        })
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

    else if (filetype === 3)
    {
      readRes = await aTest(zipArrayBuffer, renderer, renderWindow);
      defaultSource = readRes.source;
      timeSeriesData = readRes.source;
    }

    mapper.setInputData(defaultSource);

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    renderer.addActor(actor);

    actor.getProperty().setColor(1.00000, 0.40000, 0.80000);
    

    /* const scalarBarActor = vtkScalarBarActor.newInstance({
      position: [0,0,0],
      drawNanAnnotation:false,
    });

    

    renderer.addActor(scalarBarActor); */

    renderer.resetCamera();
    //renderer.setBackground(0.10196, 0.10196, 0.10196);

    renderWindow.render();

    vtkContext.current = {
      renderWindow,
      renderer,
      mapper,
      actor,
      currentTimeStep:0,
      allData:timeSeriesData,
      sceneImporter:readRes?.sceneImporter,
      lookupTable,
      defaultCamera: renderer.getActiveCamera().toJSON(),
      fullScreenRenderer:fullScreenRenderWindow
    };
    
  }


  export const viewerHelper = { createViewer }