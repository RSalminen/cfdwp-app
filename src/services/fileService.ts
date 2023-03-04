import { ITeacherOptions, IWidget } from "../types";
import axiosinstance from "./customAxios";
import { userService } from "./userService";


const postFile = async (file:File, contentType:string, simName:string, teacherId:string) => {

    const formData = new FormData();
    formData.append("file", file);
    formData.append("simName", simName);
    formData.append("fileType", contentType);
    formData.append("teacherId", teacherId);

    const response = await axiosinstance({
        method:"post",
        url:"/api/teacher/postfile",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data" ,
            Authorization: `Bearer ${userService.getToken()}`
        }
    });

    return response.status === 200;
    
}

const getSimulationsByTeacher = async (teacherId:string) => {

    const response = await axiosinstance({
        method: "get",
        url: "/api/teacher/getfiles",
        params: {teacherId: teacherId},
        headers: {Authorization: `Bearer ${userService.getToken()}`}
    });

    return response.data;
    
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

    const response = await axiosinstance({
        method: "put",
        url: "/api/teacher/updatecontent",
        data: {simId, teacherOptions, widgets},
        headers: {Authorization: `Bearer ${userService.getToken()}`}
    });

    return response.status === 200;
}

const getContent = async (simId:string) => {

    const response = await axiosinstance({
        method: "get",
        url: "/api/getcontent",
        params: {simId: simId},
    });

    return response.data[0];
}

export const fileService = { postFile, getSimulationsByTeacher, getFile, updateContent, getContent };