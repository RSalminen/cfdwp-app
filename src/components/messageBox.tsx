import useMyStore from "../store/store"
import ButtonDarkMid from "./buttonDarkMid";
import ButtonDarkSmall from "./buttonDarkSmall";
import LoadingSpinner from "./loadingSpinner";


const MessageBox = () => {

    const { message, updateMessage } = useMyStore();

    return (
        <div className="fixed z-[29] bottom-10 right-2 md:right-[200px] px-8 py-6 border bg-gray-50 w-[300px] max-w-[95%] rounded-md fade-in-card-fast shadow-lg">
            <div className="flex flex-col space-y-2 items-center w-full">
                
                <h3 className="text-[18px] font-semibold">Notification</h3>
                
                <p className="font-medium text-[16px] text-center">{message.message}</p>
                {message.status === 1 ?
                <div className="h-20 w-20">
                    <LoadingSpinner />
                </div>
                :
                <div className={`w-full flex justify-end px-3 pt-4 ${message.status === 2 ? "border-t border-green-500" : message.status === 3 && "border-t border-red-700"}`}>
                    <ButtonDarkMid btnText="Ok" fullWidth={true} onClickFn={() => updateMessage({status:0, message:""})} />
                </div>
                }
            </div>
        </div>
    )
}

export default MessageBox;