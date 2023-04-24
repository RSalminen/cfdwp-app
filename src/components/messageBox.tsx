import useMyStore from "../store/store"
import ButtonDarkMid from "./uiComponents/buttonDarkMid";
import LoadingSpinner from "./uiComponents/loadingSpinner";


const MessageBox = () => {

    const { message, updateMessage, messageProgress } = useMyStore();

    return (
        <div className="fixed z-[29] bottom-10 right-2 md:right-[200px] px-8 py-6 border bg-gray-50 w-[300px] max-w-[95%] rounded-md fade-in-card-fast shadow-lg shadow-gray-700">
            <div className="flex flex-col space-y-2 items-center w-full">
                
                <h3 className="text-[18px] font-semibold">Notification</h3>
                
                <p className="font-medium text-[16px] text-center">{message.message}</p>
                {message.status === 1 ?
                <div className="h-20 w-20">
                    <LoadingSpinner />
                </div>
                :
                <div className="flex flex-col w-full">
                    <div className="w-full flex justify-end px-3 pt-4">
                        <ButtonDarkMid btnText="Ok" fullWidth={true} onClickFn={() => updateMessage({status:0, message:""})} />
                    </div>
                    <div style={{width:`${messageProgress}%`}} className={`border-b-2 mt-4 ${message.status === 2 ? "border-green-700" : message.status === 3 && "border-red-700"}`}></div>
                </div>
                }

            </div>
        </div>
    )
}

export default MessageBox;