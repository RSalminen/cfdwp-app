import axiosinstance from "./customAxios";

let token:string = "";

const getToken = () => {return token}

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

const validateTeacher = async () => {

    try {
        const response = await axiosinstance({
            method: "get",
            url: "/api/teacher/validate",
            headers: { Authorization: `Bearer ${token}`}
        });
    
        return response.status === 200;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const userService = { login, validateTeacher, getToken }