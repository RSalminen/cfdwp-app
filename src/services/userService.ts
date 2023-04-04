import { AxiosError } from "axios";
import axiosinstance from "./customAxios";

let token:string = "";

const getToken = () => {return token}

const setToken = (newToken:string) => token = newToken;

const login = async (username:string, password:string) => {

    try {
        const response = await axiosinstance({
            method:"post",
            url: "/api/users/login",
            data: { username, password }
        });

        token = response.data.token;

        return response.data;
    } catch (e) {
        return null;
    }

}

const validateTeacherSim = async (simId:string) => {

    try {
        const response = await axiosinstance({
            method: "get",
            url: "/api/teacher/validate",
            headers: { Authorization: `Bearer ${token}`},
            params: {simId}
        });
    
        return response.status === 200;
    } catch (e) {
        return false;
    }
}

const validateToken = async (teacherid:string) => {

    try {
        const response = await axiosinstance({
            method: "get",
            url: "/api/teacher/validatetoken",
            headers: { Authorization: `Bearer ${token}`},
            params: {teacherid}
        });
    
        return response.status;
    } catch (e) {
        const err = e as AxiosError;
        return err.response?.status;
    }
}

export const userService = { login, validateTeacherSim, validateToken, getToken, setToken }