import { userService } from "../services/userService";

const validate = async (teacherid:string, setLoginFailed:React.Dispatch<React.SetStateAction<boolean>>) => {

    const teacherValid = await userService.validateToken(teacherid);
    if (teacherValid === 401) {
        setLoginFailed(true);
    }
}

const checkToken = () => {
    const loggedUserJSON = window.localStorage.getItem('loggedCFDWPUser');
    if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON);
        userService.setToken(user.token);
    }
}

const getTokenId = () => {
    const loggedUserJSON = window.localStorage.getItem('loggedCFDWPUser');
    if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON);
        return user.id;
    }
}

export const validateHelper = {validate, checkToken, getTokenId}