import DataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';
import vtkHttpSceneLoader from '@kitware/vtk.js/IO/Core/HttpSceneLoader';

export const readVTKJS = async(fileBuffer, renderer, renderWindow) => {

    const promise = new Promise((resolve, reject) => {
        const dataAccessHelper = DataAccessHelper.get("zip", {
            zipContent:fileBuffer,
            callback: (zipa) => {
            
                const sceneImporter = vtkHttpSceneLoader.newInstance({
                    dataAccessHelper,
                    renderer,
                });

                //global.sceneImporter = sceneImporter;

                sceneImporter.setUrl("index.json");
                sceneImporter.onReady(() => {

                    let scene = sceneImporter.getScene();
                    let source = scene[0].source.getOutputData();

                    const result = {
                        source,
                        sceneImporter
                    }

                    resolve(result);
                });
            },
        });
    });

    const aa = await promise;

    return aa;
};


export const applyStep = (stepIdx, sceneImporter) => {
    const steps = sceneImporter.getAnimationHandler().getTimeSteps()
    const step = steps[stepIdx];

    const scene = sceneImporter.getScene()

    const srcTimeSteps = scene[0].source.getTimeSteps();
    scene[0].source.setUpdateTimeStep(srcTimeSteps.findIndex(srcTS => srcTS === step));

    return scene[0].source.getOutputData();
    
};

export const vtkjsHelper = { readVTKJS, applyStep }