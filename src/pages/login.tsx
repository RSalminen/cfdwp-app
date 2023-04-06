import { useState } from "react"
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/customInput";
import { userService } from "../services/userService";

const ButtonDarkForm = ({btnText, fullWidth}:{btnText:string, fullWidth:boolean}) => {

    return (
        <button type="submit" className={`bg-emerald-900 text-[15px] font-medium rounded-[3px] px-3 py-2 text-white flex justify-center items-center hover:cursor-pointer h-fit ${fullWidth ? "w-full" : "w-fit"}`}>
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
        <div className="h-[100vh] w-[100vw] flex justify-center items-center">

            {/* background */}
            <img role="presentation" className="h-full w-full fixed object-cover -z-10 top-0 left-0 pointer-events-none fade-in-card" src="wavebg2.svg"/>
            <div className="h-full w-full fixed object-cover z-[-11] top-0 left-0 loginBackgroundColor" />

            <div className="border py-6 px-10 w-[280px] rounded-md shadow-lg shadow-gray-700 bg-white">
                <form onSubmit={loginClicked} className="flex flex-col space-y-3 w-full">
                    <h3 className="text-center text-[20px] font-semibold mb-2">Login</h3>
                    <CustomInput currentValue={username} labelText="username" onChange={(e:any) => setUsername(e.target.value)} />
                    <div className="w-full flex">
                        <div className="w-[176px]"><CustomInput currentValue={password} labelText="password" onChange={(e:any) => setPassword(e.target.value)} showPassword={showPassword} /></div>
                        <div className="bg-gray-200 border-b-2 border-emerald-700 px-1 flex items-center">
                            {showPassword
                            ? <svg onClick={() => setShowPassword(false)} stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757C12.568 16.983 12.291 17 12 17c-5.351 0-7.424-3.846-7.926-5 .204-.47.674-1.381 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379-.069.205-.069.428 0 .633C2.073 12.383 4.367 19 12 19zM12 5c-1.837 0-3.346.396-4.604.981L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657.069-.205.069-.428 0-.633C21.927 11.617 19.633 5 12 5zM16.972 15.558l-2.28-2.28C14.882 12.888 15 12.459 15 12c0-1.641-1.359-3-3-3-.459 0-.888.118-1.277.309L8.915 7.501C9.796 7.193 10.814 7 12 7c5.351 0 7.424 3.846 7.926 5C19.624 12.692 18.76 14.342 16.972 15.558z"></path></svg>
                            : <svg onClick={() => setShowPassword(true)} className="fill-emerald-900 hover:fill-emerald-600" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,9c-1.642,0-3,1.359-3,3c0,1.642,1.358,3,3,3c1.641,0,3-1.358,3-3C15,10.359,13.641,9,12,9z"></path><path d="M12,5c-7.633,0-9.927,6.617-9.948,6.684L1.946,12l0.105,0.316C2.073,12.383,4.367,19,12,19s9.927-6.617,9.948-6.684 L22.054,12l-0.105-0.316C21.927,11.617,19.633,5,12,5z M12,17c-5.351,0-7.424-3.846-7.926-5C4.578,10.842,6.652,7,12,7 c5.351,0,7.424,3.846,7.926,5C19.422,13.158,17.348,17,12,17z"></path></svg>
                            }
                        </div>
                    </div>
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