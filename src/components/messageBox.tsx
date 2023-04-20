import useMyStore from "../store/store"
import LoadingSpinner from "./loadingSpinner";


const MessageBox = () => {

    const { message } = useMyStore();

    return (
        <div className="fixed z-[29] bottom-10 right-2 md:right-[200px] px-8 py-4 border bg-gray-50 max-w-[500px] rounded-md">
            <div className="flex flex-col space-y-3 items-center">
                <p className="font-medium text-[16px]">{message.message}</p>
                <div className="h-20 w-20">
                    <LoadingSpinner />
                </div>
            </div>
        </div>
    )
}

export default MessageBox;