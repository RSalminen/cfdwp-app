import { AxiosError } from "axios";
import { ITeacherOptions, IWidget } from "../types";
import axiosinstance from "./customAxios";
import { userService } from "./userService";
import useMyStore from "../store/store";


const postFile = async (file:File, fileType:string, simName:string, teacherId:string) => {

    const postDate = new Date();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("simName", simName);
    formData.append("fileType", fileType);
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

        return response.status === 200;
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) {
            useMyStore.getState().authFailed();
        }
    }
    
}

const getSimulationsByTeacher = async (teacherId:string) => {
    
    try {
        const response = await axiosinstance({
            method: "get",
            url: "/api/teacher/getfiles",
            params: {teacherId: teacherId},
            headers: {Authorization: `Bearer ${userService.getToken()}`}
        });

        return response.data;

    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();
    }

    
}

const getFile = async (simId:string, setLoadProgress: React.Dispatch<React.SetStateAction<number>>) => {

    const response = await axiosinstance({
       method: "get",
       url: "/api/getFile",
       params: {simId: simId},
    });

    const signedUrl = response.data.url;

    const fileResponse = await axiosinstance({
        method: "get",
        url: signedUrl,
        responseType: 'arraybuffer',
        onDownloadProgress(progressEvent) {
            const loadedpercentage = progressEvent.loaded * 100 / progressEvent.total!;
            setLoadProgress(Math.round(loadedpercentage));
        },
    });
    

    return {file: fileResponse.data, fileType: response.headers['content-type']};
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

export const fileService = { postFile, getSimulationsByTeacher, getFile, updateContent, getContent, getAllSims };