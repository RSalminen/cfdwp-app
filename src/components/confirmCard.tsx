import ButtonCancel from "./uiComponents/buttonCancel";
import ButtonDark from "./uiComponents/buttonDark";

const ConfirmCard = ({message, itemName="", onConfirm, onCancel} : {message:string, itemName?:string, onConfirm:Function, onCancel:Function}) => {

    return (
        <div className="fixed z-20 top-0 left-0 w-full h-full bg-white bg-opacity-90 flex justify-center items-center">
            <div className="flex flex-col space-y-4 w-fit items-center px-6 py-6 bg-white border shadow-lg rounded-md max-w-[350px]">
                <div className="w-full">
                    <p>{message}</p>
                    <p className="font-semibold">{itemName}</p>
                </div>
                <div className="flex w-[80%] justify-center">
                    <ButtonDark btnText="Confirm" onClickFn={onConfirm} fullWidth={true} />
                    <ButtonCancel btnText="Cancel" onClickFn={onCancel} fullWidth={true} />
                </div>
            </div>
        </div>
    )
}

export default ConfirmCard;