import { AxiosError } from "axios";
import axiosinstance from "./customAxios";
import { userService } from "./userService";
import useMyStore from "../store/store";

const postCollection = async (title:string, teacherId:string) => {

    const postDate = (new Date()).toISOString();
    try {
        const response = await axiosinstance({
            method:"post",
            url:"/api/teacher/postcollection",
            data: {
                title,
                teacherId,
                postDate,
            },
            headers: {Authorization: `Bearer ${userService.getToken()}`}
        });

        getCollectionsByTeacher(teacherId);
        return response.status === 200; 
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();
    }
}

const deleteCollection = async (collectionId:number, teacherId:string) => {
    try {
        const response = await axiosinstance({
            method:"delete",
            url:"/api/teacher/deleteCollection",
            params: {
                collectionId,
                teacherId
            },
            headers: {Authorization: `Bearer ${userService.getToken()}`}
        });

        getCollectionsByTeacher(teacherId);

        return response.status === 200; 
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();
    }
}

const getCollectionsByTeacher = async (teacherId:string) => {

    try {
        const response = await axiosinstance({
            method:"get",
            url: "/api/teacher/getcollections",
            params: { teacherId },
            headers: { Authorization: `Bearer ${userService.getToken()}` }
        });

        useMyStore.getState().setCollectionsByTeacher(response.data);

        return true;
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();

        return false;
    }
}


export const collectionService = { postCollection, deleteCollection, getCollectionsByTeacher }