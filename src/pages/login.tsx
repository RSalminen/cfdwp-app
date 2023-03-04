import { useState } from "react"
import { useNavigate } from "react-router-dom";
import ButtonDark from "../components/buttonDark";
import ButtonDarkMid from "../components/buttonDarkMid";
import CustomInput from "../components/customInput";
import { userService } from "../services/userService";

const Login = () => {

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const navigate = useNavigate();

    const loginClicked = async () => {
        const loggedUser = await userService.login(username, password);
        if (loggedUser) navigate(`/teacher/${loggedUser.id}`);
        else {
            setUsername("");
            setPassword("");
        }
    }

    return (
        <div className="h-[100vh] w-full flex justify-center items-center">
            <div className="border py-6 px-10 w-[280px] rounded-md shadow-md shadow-gray-400">
                <div className="flex flex-col space-y-3">
                    <h3 className="text-center text-[20px] font-semibold mb-2">Login</h3>
                    <CustomInput currentValue={username} labelText="username" onChange={(e:any) => setUsername(e.target.value)} />
                    <CustomInput currentValue={password} labelText="password" onChange={(e:any) => setPassword(e.target.value)} />
                    <div className="pt-1 flex flex-col space-y-0.5">
                        <ButtonDark btnText="Log in" fullWidth={true} onClickFn={loginClicked} />
                        <div className="text-end text-[13px]">Forgot password?</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login