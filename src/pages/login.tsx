import { useState } from "react"
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/customInput";
import { userService } from "../services/userService";

const ButtonDarkForm = ({btnText, fullWidth}:{btnText:string, fullWidth:boolean}) => {

    return (
        <button type="submit" className={`bg-emerald-900 text-[15px] rounded-[3px] px-3 py-2 text-white flex justify-center items-center hover:cursor-pointer h-fit ${fullWidth ? "w-full" : "w-fit"}`}>
            {btnText}
        </button>
    );
}


const Login = () => {

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const navigate = useNavigate();

    const loginClicked = async (e:any) => {
        e.preventDefault();
        const loggedUser = await userService.login(username, password);
        if (loggedUser) {
            window.localStorage.setItem('loggedCFDWPUser', JSON.stringify(loggedUser));
            navigate(`/teacher/${loggedUser.id}`);
        }
        else {
            setUsername("");
            setPassword("");
        }
    }

    return (
        <div className="h-[100vh] w-full flex justify-center items-center">
            <div className="border py-6 px-10 w-[280px] rounded-md shadow-md shadow-gray-400">
                <form onSubmit={loginClicked} className="flex flex-col space-y-3">
                    <h3 className="text-center text-[20px] font-semibold mb-2">Login</h3>
                    <CustomInput currentValue={username} labelText="username" onChange={(e:any) => setUsername(e.target.value)} />
                    <CustomInput currentValue={password} labelText="password" onChange={(e:any) => setPassword(e.target.value)} password={true} />
                    <div className="pt-1 flex flex-col space-y-0.5">
                        <ButtonDarkForm btnText="Log in" fullWidth={true} />
                        <div className="text-end text-[13px]">Forgot password?</div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login