import { AxiosError } from "axios";
import { ITeacherOptions, IWidget } from "../types";
import axiosinstance from "./customAxios";
import { userService } from "./userService";
import useMyStore from "../store/store";
import { collectionService } from "./collectionService";


const postFile = async (file:File, fileType:string, simName:string, teacherId:string) => {

    const filetypeNr = (fileType === ".vtp" ? 1 : fileType === ".vti" ? 2 : 3);

    const postDate = new Date();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("simName", simName);
    formData.append("fileType", filetypeNr.toString());
    formData.append("teacherId", teacherId);
    formData.append("date", postDate.toISOString());

    try {
        const response = await axiosinstance({
            method:"post",
            url:"/api/teacher/postfile",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${userService.getToken()}`
            }
        });

        getSimulationsByTeacher(teacherId);

        return response.status === 200;
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) {
            useMyStore.getState().authFailed();
        }
    }   
}

const deleteSimulation = async (simId:string, teacherId:string) => {
    try {
        const response = await axiosinstance({
            method:"delete",
            url:"/api/teacher/deletefile",
            params: { simId, teacherId },
            headers: {
                Authorization: `Bearer ${userService.getToken()}`
            }
        });

        getSimulationsByTeacher(teacherId);


        return response.status;

    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) {
            useMyStore.getState().authFailed();
        }

        return false;
    }
}

const setToCollection = async (simId:string, teacherId:string, newValue:number) => {

    try {
        await axiosinstance({
            method:"put",
            url:"/api/teacher/setToCollection",
            data: { simId, teacherId, collectionId:newValue},
            headers: {
                Authorization: `Bearer ${userService.getToken()}`
            }
        });

        collectionService.getCollectionsByTeacher(teacherId);

        return true;

    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) {
            useMyStore.getState().authFailed();
        }

        return false;
    }
}

const removeFromCollection = async (simId:string, collId:string, teacherId:string) => {

    try {
        await axiosinstance({
            method:"delete",
            url:"/api/teacher/removeFromCollection",
            data: { simId, teacherId, collectionId:collId},
            headers: {
                Authorization: `Bearer ${userService.getToken()}`
            }
        });

        collectionService.getCollectionsByTeacher(teacherId);

        return true;

    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) {
            useMyStore.getState().authFailed();
        }

        return false;
    }

}

const getSimulationsByTeacher = async (teacherId:string) => {
    
    try {
        const response = await axiosinstance({
            method: "get",
            url: "/api/teacher/getfiles",
            params: { teacherId },
            headers: {Authorization: `Bearer ${userService.getToken()}`}
        });

        useMyStore.getState().setSimulationsByTeacher(response.data);

        return true;

    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();
        return false;
    }

    
}

const getFile = async (simId:string, setLoadProgress: React.Dispatch<React.SetStateAction<number>>) => {

    const response = await axiosinstance({
       method: "get",
       url: "/api/getFile",
       params: {simId: simId},
    });

    const { url, simName, filetype, notes, teacher_options } = response.data;

    const signedUrl = url;

    const fileResponse = await axiosinstance({
        method: "get",
        url: signedUrl,
        responseType: 'arraybuffer',
        onDownloadProgress(progressEvent) {
            const loadedpercentage = progressEvent.loaded * 100 / progressEvent.total!;
            setLoadProgress(Math.round(loadedpercentage));
        },
    });
    
    return {simName, file: fileResponse.data, filetype, notes, teacher_options};
}

const updateContent = async (widgets:IWidget[], teacherOptions:ITeacherOptions, simId:string) => {
    try {
        const response = await axiosinstance({
            method: "put",
            url: "/api/teacher/updatecontent",
            data: {simId, teacherOptions, widgets},
            headers: {Authorization: `Bearer ${userService.getToken()}`}
        });

        return response.status === 200;
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();

        return false;
    }
}

const getContent = async (simId:string) => {

    const response = await axiosinstance({
        method: "get",
        url: "/api/getcontent",
        params: {simId: simId},
    });

    return response.data[0];
}

const getAllSims = async () => {

    const response = await axiosinstance({
        method:"get",
        url: "/api/getallsims"
    });
    return response.data;
}

export const fileService = { 
    postFile, 
    deleteSimulation,
    setToCollection,
    removeFromCollection,
    getSimulationsByTeacher,
    getFile,
    updateContent,
    getContent,
    getAllSims
};