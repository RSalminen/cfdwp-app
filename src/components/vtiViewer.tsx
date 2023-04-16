
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Volume';

import { useContext, useEffect, useRef, useState } from 'react'
import { ICustomOptions, IFileObject, IVTIContext } from '../types';
import { fileService } from '../services/fileService';
import { useParams } from 'react-router-dom';
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
import SelectionSmaller from './selectionSmaller';

const colorSchemes : {[key:string] : string} = {
  "Rainbow": "erdc_rainbow_bright",
  "Cool to Warm": "Cool to Warm",
  "Grayscale": "Grayscale"
}

const createVtiViewer = async (vtiContainerRef:React.MutableRefObject<HTMLDivElement | null>, vtiContext: React.MutableRefObject<IVTIContext | null>, widgetRef:React.MutableRefObject<HTMLDivElement | null>, file:File) => {
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




  const controllerWidget = vtkVolumeController.newInstance({
    size: [300, 150],
    rescaleColorMap: false,
  });
  const isBackgroundDark = true;
  controllerWidget.setContainer(widgetRef.current);
  controllerWidget.setupContent(renderWindow, actor, isBackgroundDark);

  //controllerWidget.updatePreset(colorSchemes["Rainbow"]);

  // First render
  renderer.resetCamera();
  renderWindow.render();


  vtiContext.current = {
    controllerWidget
  }
}



const VtiViewer = ({vtiContext, customOptionsContext, onLoadSuccess} : {vtiContext:React.MutableRefObject<IVTIContext | null>, customOptionsContext:React.MutableRefObject<ICustomOptions | null>, onLoadSuccess:Function}) => {

    const { simLoaded } = useContext(VtiUIContext);
        
    const hasEnded = useRef<boolean>(false);

    const vtiContainerRef = useRef<HTMLDivElement | null>(null);
    const widgetRef = useRef<HTMLDivElement | null>(null);
    const startEffectRun = useRef<boolean>(false);

    const [loadProgress, setLoadProgress] = useState<number>(0);
    
    const { simid } = useParams();

    const [activecolorScheme, setActiveColorScheme] = useState<string | null>("Rainbow");

    const load = async () => {

        const fileObject : IFileObject = await fileService.getFile(simid!, setLoadProgress);
        customOptionsContext.current = {notes:fileObject.notes, teacherOptions:fileObject.teacher_options}
        
        //I want to stop execution if the user goes back while loading the simulation
        if (hasEnded.current) return;
        
        await createVtiViewer(vtiContainerRef, vtiContext, widgetRef, fileObject.file);
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

    const presetChanged = (str:string) => {

      const { controllerWidget } = vtiContext.current!;

      controllerWidget.updatePreset(colorSchemes[str]);
      
      setActiveColorScheme(str);
    }

    return (

        <>
        {(!simLoaded) &&
          <ViewerLoadingScreen loadProgress={loadProgress} />
        }
      

        <div className="w-full h-full absolute z-[2] flex justify-between pointer-events-none">
          <div className="flex items-center">
            <div className="fade-in-card-fast bg-black bg-opacity-90 w-fit ml-4 py-4 px-4 text-white flex flex-col pointer-events-auto rounded-md border border-emerald-900 shadow-lg shadow-black min-h-[60%] overflow-y-auto">
              <div className="flex justify-between pb-1 border-b-2">
                <h3 className="text-[17px]">Controller</h3>
                <svg onClick={() => {}} className="w-2 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 352H48c-26.5 0-48 21.5-48 48v32c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-32c0-26.5-21.5-48-48-48z"></path></svg>
              </div>

              <div className="flex flex-col text-[13px] px-2">

                <div className="flex flex-col space-y-1 pb-3 pt-1.5 border-b">
                  <h5>Colors</h5>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex space-x-2 justify-center">
                      <SelectionSmaller selectedItem={activecolorScheme} onChangeFn={presetChanged} allItems={Object.keys(colorSchemes)} thisItem={null} fullWidth={true} />
                      <SelectionSmaller selectedItem={activecolorScheme} onChangeFn={() => {}} allItems={Object.keys(colorSchemes)} thisItem={null} fullWidth={true} />
                    </div>
                    <div className="flex justify-center">
                      <div ref={widgetRef}></div>
                    </div>
                  </div>
                </div>
              
              </div>
              
            </div>
          </div>
          
          <div></div>
        </div>

        <div ref={vtiContainerRef}>
        </div>

      </>
    );
}

export default VtiViewer;