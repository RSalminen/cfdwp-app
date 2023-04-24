import { useContext, useEffect, useState } from "react";
import { ICustomOptions, ITeacherOptions, IVTKContext, IWidget } from "../types";
import MultiSelection from "./uiComponents/multiSelection";
import { UIContext } from "../pages/studentView";
import CustomInput from "./uiComponents/customInput";
import CustomTextArea from "./uiComponents/customTextArea";
import ButtonDarkMid from "./uiComponents/buttonDarkMid";
import { useParams } from "react-router-dom";

import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera'

import { fileService } from "../services/fileService";
import ButtonDark from "./uiComponents/buttonDark";
import Selection from "./uiComponents/selection";
import { colorSchemes } from "./viewerUI";
import ToggleSwitch from "./uiComponents/toggleSwitch";

import { isEqual } from "lodash"; 
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";
import ButtonCancel from "./uiComponents/buttonCancel";
import ButtonYellow from "./uiComponents/buttonYellow";
import MessageBox from "./messageBox";
import useMyStore from "../store/store";
import LoadingSpinner from "./uiComponents/loadingSpinner";


const ListedWidget = ({widget, widgets, setWidgets} : {widget:IWidget, widgets:IWidget[], setWidgets:React.Dispatch<React.SetStateAction<IWidget[]>>}) => {

    return (
        <SortableItem>
            <div className="flex justify-between items-center bg-gray-200 px-2 py-0.5 item rounded-md w-full overflow-hidden text-ellipsis border cursor-grab hover:bg-emerald-50">
                <p className="overflow-x-clip text-[13px] mt-[-1px] text-ellipsis whitespace-nowrap flex-1">{widget.title.length > 0 ? widget.title : widget.description}</p>
                <svg className="cursor-pointer text-gray-700 hover:text-gray-800" onClick={() => setWidgets(widgets.filter((x:IWidget) => x !== widget))} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
            </div>
        </SortableItem>
    );
}


const TeacherViewerUI = ({vtkContext} : {vtkContext:React.MutableRefObject<IVTKContext | null>}) => {
    
    const { simLoaded, customOptionsContext, setCustomOptionsContext } = useContext(UIContext);

    const { message, updateMessage } = useMyStore();

    const { simid } = useParams();

    const [menuTab, setMenuTab] = useState<string>("General");

    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [selectedStartingField, setSelectedStartingField] = useState<string>("Solid color");
    const [selectedStartingPreset, setSelectedStartingPreset] = useState<string>("Jet");
    const [controllerHiddenAtStart, setControllerHiddenAtStart] = useState<boolean>(false);
    const [noteShownAtStart, setNoteShownAtStart] = useState<boolean>(false);
    const [startingCam, setStartingCam] = useState<object | null>(null);

    const [widgets, setWidgets] = useState<IWidget[]>([]);

    const [allFields, setAllFields] = useState<string[] | null>(null);

    const [titleInput, setTitleInput] = useState<string>("");
    const [descriptionArea, setDescriptionArea] = useState<string>("");
    const [widgetCam, setWidgetCam] = useState<object | null>(null);


    const [oldOptionsContext, setOldOptionsContext] = useState<ICustomOptions | null>(null);

    const startupValues = (context:ICustomOptions | null) => {

        if (!context) return;

        const restrictFields = context.teacherOptions.restrictFields;
        const startingField = context.teacherOptions.startingField;
        const startingColor = context.teacherOptions.startingPreset;
        const hiddenAtStart = context.teacherOptions.controllerHidden;
        const noteShown = context.teacherOptions.noteShown;
        const startingCamera = context.teacherOptions.startingCamera;
        const widgets = context.notes;
        
        const defaultSource = vtkContext.current?.allData[0];
    
        const allPointFields = defaultSource.getPointData().getArrays().map((ar:vtkDataArray)=> "(p) " + ar.getName());
        const allCellFields = defaultSource.getCellData().getArrays().map((ar:vtkDataArray)=> "(c) " + ar.getName());
        
        setAllFields(["Solid color", ...allPointFields, ...allCellFields]);

        if (restrictFields) setSelectedFields(restrictFields);

        if (startingField) setSelectedStartingField(startingField);

        if (startingColor) setSelectedStartingPreset(startingColor);

        if (hiddenAtStart) setControllerHiddenAtStart(hiddenAtStart);

        if (noteShown) setNoteShownAtStart(noteShown);

        if (startingCamera) setStartingCam(startingCamera);
        else setStartingCam(null);

        if (widgets) setWidgets(widgets);
    }


    useEffect(() => {
        if (customOptionsContext) {

            startupValues(customOptionsContext);
            setOldOptionsContext(customOptionsContext);

        }

    }, [simLoaded]);

    const addWidget = () => {
    
        const widgetObject:IWidget = {
          title: titleInput,
          description: descriptionArea,
          camera:widgetCam,
        }
    
        resetWidget();
    
        const newWidgets = widgets.concat(widgetObject)
        setWidgets(newWidgets);

    }

    const resetWidget = () => {
        setTitleInput("");
        setDescriptionArea("");
        setWidgetCam(null);
    }
    
    const saveCamera = (setCam:React.Dispatch<React.SetStateAction<object | null>>) => {
        const { renderer } : IVTKContext = vtkContext.current!;
        setCam(renderer!.getActiveCamera().toJSON());

    }

    const setCameraToSaved = (cam:object) => {
        const { renderer, renderWindow, defaultCamera } : IVTKContext = vtkContext.current!;

        if (cam === null) {
            const newCamera :vtkCamera = vtkCamera.newInstance(defaultCamera);
            renderer!.setActiveCamera(newCamera);
            renderWindow?.render();
            return;
        }
        
        const newCamera :vtkCamera = vtkCamera.newInstance(cam);
        renderer!.setActiveCamera(newCamera);

        renderWindow?.render();
        
    }

    const createTeacherOptionsObj = () => {

        let realStartingField : string | null = selectedStartingField;
        let realStartingColor : string | null = selectedStartingPreset;

        if (selectedStartingField === "Solid color") realStartingField = null;
        if (selectedStartingPreset === "Jet") realStartingColor = null;

        const newOptions : ITeacherOptions = {
            ...(selectedFields.length > 0) && {restrictFields: selectedFields},
            ...(realStartingField) && {startingField: realStartingField},
            ...(realStartingColor) && {startingPreset: realStartingColor},
            ...(controllerHiddenAtStart) && {controllerHidden:controllerHiddenAtStart},
            ...(noteShownAtStart) && {noteShown:noteShownAtStart},
            ...(startingCam) && {startingCamera:startingCam}
        }

        return newOptions;
    }

    const checkIfChanges = () => {
        
        
        if (!oldOptionsContext) return;
        const newOptions : ITeacherOptions = createTeacherOptionsObj();
        
        //The checking if the objects are equal, regardless of order
        const teacherOptionsChanged = !isEqual(newOptions, oldOptionsContext?.teacherOptions);

        //The teacher can manually change the order, so whether order is the same is checked here        
        const notesChanged = JSON.stringify(widgets) !== JSON.stringify(oldOptionsContext?.notes);

        return teacherOptionsChanged || notesChanged;

    }

    const saveChanges = async () => {
        
        //Creating the teacher_options object and only including the members that are not null
        const newTeacherOptions : ITeacherOptions = createTeacherOptionsObj();

        updateMessage({message: "Saving changes...", status:1});

        const response = await fileService.updateContent(widgets, newTeacherOptions, simid!);
    
        if (response) {
            updateMessage({message: "Changes saved!", status:2});

            const newTeacherOptions = applyPreview();
            setOldOptionsContext(newTeacherOptions);

        }
        else updateMessage({message: "Saving the changes failed", status:3});
    }

    const onSortEnd = (oldIndex: number, newIndex: number) => {
        setWidgets((array:IWidget[]) => arrayMoveImmutable(array, oldIndex, newIndex));
    };

    const isAddWidgetEmpty = () => {
        return (titleInput.length === 0 && descriptionArea.length === 0 && widgetCam === null);
    }

    const applyPreview = () => {
        const newTeacherOptions : ITeacherOptions = createTeacherOptionsObj()
        
        const newOptionsContext = {teacherOptions:newTeacherOptions, notes:widgets}
        setCustomOptionsContext(newOptionsContext);

        return newOptionsContext;
    }

    const cancelChanges = () => {
        setCustomOptionsContext(oldOptionsContext);
        startupValues(oldOptionsContext);
    }

    return (
        
        <>
        <div className="w-full h-full absolute top-0 right-0 z-[20]">

            {/* Display message */}
            {message.status !== 0 &&
                <MessageBox />
            }

            <div className="w-full h-full bg-white pointer-events-auto px-2 py-2 flex flex-col justify-between">
                
                {/* Loading teacher options */}
                {allFields === null ?
                <div className="w-full h-full flex flex-col justify-center items-center space-y-2">
                    <div className="h-20 w-20"><LoadingSpinner /></div>
                    <div>Loading options...</div>
                </div>
                :
                <>
                {/* Sidebar with teacher options */}
                <div className="flex space-x-4 pb-2 border-b border-emerald-900">
                    <div className={`${menuTab === "General" && "border-b-[3px] border-emerald-600"} cursor-pointer`} onClick={() => setMenuTab("General")}>General</div>
                    <div className={`${menuTab === "Notes" && "border-b-[3px] border-emerald-600"} cursor-pointer`} onClick={() => setMenuTab("Notes")}>Notes</div>
                </div>

                {menuTab === "General" &&
                <div className="flex flex-col h-full overflow-y-auto px-1">
                    
                    <div className="border-b border-gray-500 flex flex-col pb-2">
                        <h4 className="font-semibold text-[15px] py-0.5">Select fields:</h4>
                        <div className="w-[220px]">
                            <MultiSelection selectedItems={selectedFields!} setSelectedItems={setSelectedFields} allItems={allFields} />
                        </div>
                    </div>

                    <div className="border-b border-gray-500 flex-col pb-2">
                        <h4 className="font-semibold text-[15px] py-0.5">Starting field:</h4>
                        <Selection selectedItem={selectedStartingField} allItems={allFields} onChangeFn={(str:string) => setSelectedStartingField(str)} fullWidth={false} thisItem={null} light />
                    </div>

                    <div className="border-b border-gray-500 flex flex-col pb-2">
                        <h4 className="font-semibold text-[15px] py-0.5">Starting color:</h4>
                        <Selection selectedItem={selectedStartingPreset} allItems={Object.keys(colorSchemes)} onChangeFn={(str:string) => setSelectedStartingPreset(str)} fullWidth={false} thisItem={null} light />
                    </div>

                    <div className="border-b border-gray-500 py-2">
                        <div className="flex items-center">
                            <h5 className="text-[14px]">Starting camera:</h5>
                            <p onClick={() => setCameraToSaved(startingCam!)} className={`${startingCam ? "bg-emerald-200" : "bg-gray-200"} px-2 rounded-md ml-1 text-[15px] cursor-pointer font-medium`}>{startingCam ? "Set" : "Default"}</p>
                            <svg onClick={() => saveCamera(setStartingCam)} className="h-5 w-5 ml-2 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 3h2v2H3V3zm4 0h2v2H7V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm0 4h2v2h-2V7zM3 19h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3V7zm7.667 4l1.036-1.555A1 1 0 0 1 12.535 9h2.93a1 1 0 0 1 .832.445L17.333 11H20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2.667zM9 19h10v-6h-2.737l-1.333-2h-1.86l-1.333 2H9v6zm5-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></g><title>Set current view as focus</title></svg>
                            <svg onClick={() => setStartingCam(null)} className="h-[17px] w-[17px] ml-1 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,16c1.671,0,3-1.331,3-3s-1.329-3-3-3s-3,1.331-3,3S10.329,16,12,16z"></path><path d="M20.817,11.186c-0.12-0.583-0.297-1.151-0.525-1.688c-0.225-0.532-0.504-1.046-0.83-1.531 c-0.324-0.479-0.693-0.926-1.098-1.329c-0.404-0.406-0.853-0.776-1.332-1.101c-0.483-0.326-0.998-0.604-1.528-0.829 c-0.538-0.229-1.106-0.405-1.691-0.526c-0.6-0.123-1.219-0.182-1.838-0.18V2L8,5l3.975,3V6.002C12.459,6,12.943,6.046,13.41,6.142 c0.454,0.094,0.896,0.231,1.314,0.409c0.413,0.174,0.813,0.392,1.188,0.644c0.373,0.252,0.722,0.54,1.038,0.857 c0.315,0.314,0.604,0.663,0.854,1.035c0.254,0.376,0.471,0.776,0.646,1.191c0.178,0.417,0.314,0.859,0.408,1.311 C18.952,12.048,19,12.523,19,13s-0.048,0.952-0.142,1.41c-0.094,0.454-0.23,0.896-0.408,1.315 c-0.175,0.413-0.392,0.813-0.644,1.188c-0.253,0.373-0.542,0.722-0.858,1.039c-0.315,0.316-0.663,0.603-1.036,0.854 c-0.372,0.251-0.771,0.468-1.189,0.645c-0.417,0.177-0.858,0.314-1.311,0.408c-0.92,0.188-1.906,0.188-2.822,0 c-0.454-0.094-0.896-0.231-1.314-0.409c-0.416-0.176-0.815-0.393-1.189-0.645c-0.371-0.25-0.719-0.538-1.035-0.854 c-0.315-0.316-0.604-0.665-0.855-1.036c-0.254-0.376-0.471-0.776-0.646-1.19c-0.178-0.418-0.314-0.86-0.408-1.312 C5.048,13.952,5,13.477,5,13H3c0,0.611,0.062,1.221,0.183,1.814c0.12,0.582,0.297,1.15,0.525,1.689 c0.225,0.532,0.504,1.046,0.831,1.531c0.323,0.477,0.692,0.924,1.097,1.329c0.406,0.407,0.854,0.777,1.331,1.099 c0.479,0.325,0.994,0.604,1.529,0.83c0.538,0.229,1.106,0.405,1.691,0.526C10.779,21.938,11.389,22,12,22s1.221-0.062,1.814-0.183 c0.583-0.121,1.151-0.297,1.688-0.525c0.537-0.227,1.052-0.506,1.53-0.83c0.478-0.322,0.926-0.692,1.331-1.099 c0.405-0.405,0.774-0.853,1.1-1.332c0.325-0.483,0.604-0.998,0.829-1.528c0.229-0.54,0.405-1.108,0.525-1.692 C20.938,14.221,21,13.611,21,13S20.938,11.779,20.817,11.186z"></path><title>Restore to default</title></svg>
                        </div>
                        
                    </div>

                    <div className="border-b border-gray-500 py-2 w-full">
                        <ToggleSwitch text="Controller hidden at start" isActive={controllerHiddenAtStart} onChangeFn={() => setControllerHiddenAtStart(!controllerHiddenAtStart)} />
                    </div>

                    <div className="border-b border-gray-500 py-2 w-full">
                        <ToggleSwitch text="Note open at start" isActive={noteShownAtStart} onChangeFn={() => setNoteShownAtStart(!noteShownAtStart)} />
                    </div>
                    
                </div>
                }

                {menuTab === "Notes" &&
                <div className="overflow-y-auto mb-2 h-full w-full">
                    <div className="w-full flex flex-col items-center px-4 py-1.5">
                        <h5 className="font-semibold">My widgets</h5>
                        {widgets.length === 0 && <p className="text-[13px] mt-2">No widgets added</p>}
                        

                        <SortableList onSortEnd={onSortEnd} className="list w-full flex flex-col space-y-1 pb-2 pt-1" draggedItemClassName="dragged">
                            {widgets.map((widget,idx) => (
                                <ListedWidget key={widget.title + idx} widget={widget} widgets={widgets} setWidgets={setWidgets} />
                                
                            ))}
                        </SortableList>
                    

                    </div>

                    <div className="flex flex-col items-center border-y border-gray-500 py-2 space-y-2 px-4">
                        <h5 className="font-semibold">Add widget</h5>
                        <CustomInput labelText="Title" onChange={(e:React.ChangeEvent<HTMLInputElement>) => {setTitleInput(e.target.value)}} currentValue={titleInput} />
                        <CustomTextArea labelText="Description" onChange={(e:React.ChangeEvent<HTMLInputElement>) => {setDescriptionArea(e.target.value)}} currentValue={descriptionArea} />
                        
                        <div className="flex pt-2 items-center">
                            <h5 className="text-[14px]">Camera focus:</h5>
                            <p onClick={() => setCameraToSaved(widgetCam!)} className={`${widgetCam ? "bg-emerald-200" : "bg-gray-200"} px-2 rounded-md ml-1 text-[15px] cursor-pointer font-medium`}>{widgetCam ? "Set" : "Default"}</p>
                            <svg onClick={() => saveCamera(setWidgetCam)} className="h-5 w-5 ml-2 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 3h2v2H3V3zm4 0h2v2H7V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm4 0h2v2h-2V3zm0 4h2v2h-2V7zM3 19h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3v-2zm0-4h2v2H3V7zm7.667 4l1.036-1.555A1 1 0 0 1 12.535 9h2.93a1 1 0 0 1 .832.445L17.333 11H20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h2.667zM9 19h10v-6h-2.737l-1.333-2h-1.86l-1.333 2H9v6zm5-1a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></g><title>Set current view as focus</title></svg>
                            <svg onClick={() => setWidgetCam(null)} className="h-[17px] w-[17px] ml-1 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,16c1.671,0,3-1.331,3-3s-1.329-3-3-3s-3,1.331-3,3S10.329,16,12,16z"></path><path d="M20.817,11.186c-0.12-0.583-0.297-1.151-0.525-1.688c-0.225-0.532-0.504-1.046-0.83-1.531 c-0.324-0.479-0.693-0.926-1.098-1.329c-0.404-0.406-0.853-0.776-1.332-1.101c-0.483-0.326-0.998-0.604-1.528-0.829 c-0.538-0.229-1.106-0.405-1.691-0.526c-0.6-0.123-1.219-0.182-1.838-0.18V2L8,5l3.975,3V6.002C12.459,6,12.943,6.046,13.41,6.142 c0.454,0.094,0.896,0.231,1.314,0.409c0.413,0.174,0.813,0.392,1.188,0.644c0.373,0.252,0.722,0.54,1.038,0.857 c0.315,0.314,0.604,0.663,0.854,1.035c0.254,0.376,0.471,0.776,0.646,1.191c0.178,0.417,0.314,0.859,0.408,1.311 C18.952,12.048,19,12.523,19,13s-0.048,0.952-0.142,1.41c-0.094,0.454-0.23,0.896-0.408,1.315 c-0.175,0.413-0.392,0.813-0.644,1.188c-0.253,0.373-0.542,0.722-0.858,1.039c-0.315,0.316-0.663,0.603-1.036,0.854 c-0.372,0.251-0.771,0.468-1.189,0.645c-0.417,0.177-0.858,0.314-1.311,0.408c-0.92,0.188-1.906,0.188-2.822,0 c-0.454-0.094-0.896-0.231-1.314-0.409c-0.416-0.176-0.815-0.393-1.189-0.645c-0.371-0.25-0.719-0.538-1.035-0.854 c-0.315-0.316-0.604-0.665-0.855-1.036c-0.254-0.376-0.471-0.776-0.646-1.19c-0.178-0.418-0.314-0.86-0.408-1.312 C5.048,13.952,5,13.477,5,13H3c0,0.611,0.062,1.221,0.183,1.814c0.12,0.582,0.297,1.15,0.525,1.689 c0.225,0.532,0.504,1.046,0.831,1.531c0.323,0.477,0.692,0.924,1.097,1.329c0.406,0.407,0.854,0.777,1.331,1.099 c0.479,0.325,0.994,0.604,1.529,0.83c0.538,0.229,1.106,0.405,1.691,0.526C10.779,21.938,11.389,22,12,22s1.221-0.062,1.814-0.183 c0.583-0.121,1.151-0.297,1.688-0.525c0.537-0.227,1.052-0.506,1.53-0.83c0.478-0.322,0.926-0.692,1.331-1.099 c0.405-0.405,0.774-0.853,1.1-1.332c0.325-0.483,0.604-0.998,0.829-1.528c0.229-0.54,0.405-1.108,0.525-1.692 C20.938,14.221,21,13.611,21,13S20.938,11.779,20.817,11.186z"></path><title>Restore to default</title></svg>
                        </div>

                        <div className="flex space-x-1 w-full pt-2">
                            <ButtonDarkMid btnText="Add widget" onClickFn={addWidget} fullWidth={true} deactive={isAddWidgetEmpty()} />
                            <ButtonCancel btnText="Reset" onClickFn={resetWidget} fullWidth={true} deactive={isAddWidgetEmpty()} />
                        </div>
                    </div>
                </div>
                }

                <div className="flex space-x-1 w-full mt-1">
                    <ButtonDark btnText="Save changes" onClickFn={saveChanges} fullWidth={true} deactive={!checkIfChanges()} />
                    <ButtonYellow btnText="Preview" onClickFn={applyPreview} fullWidth={true} deactive={!checkIfChanges()} />       
                    <ButtonCancel btnText="Cancel" onClickFn={cancelChanges} fullWidth={true} deactive={!checkIfChanges()} />                    
                </div>
                </>
            }

            </div>
        </div>
        </>

    )
}

export default TeacherViewerUI