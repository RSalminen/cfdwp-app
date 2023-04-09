import { AxiosError } from "axios";
import axiosinstance from "./customAxios";
import { userService } from "./userService";
import useMyStore from "../store/store";

const postCollection = async (title:string, teacherid:string) => {

    const postDate = (new Date()).toISOString();
    try {
        const response = await axiosinstance({
            method:"post",
            url:"/api/teacher/postcollection",
            data: {
                title,
                teacherid,
                postDate,
            },
            headers: {Authorization: `Bearer ${userService.getToken()}`}
        });

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

        return response.data;
    } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) useMyStore.getState().authFailed();
    }
}

export const collectionService = { postCollection, getCollectionsByTeacher }