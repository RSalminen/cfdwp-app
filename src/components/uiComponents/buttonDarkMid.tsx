
const ButtonDarkMid = ({btnText, onClickFn, fullWidth, deactive=false}:{btnText:string, onClickFn?:Function, fullWidth?:boolean, deactive?:boolean}) => {

    return (
        <button className={`${deactive ? "bg-gray-700 cursor-not-allowed" : "bg-emerald-900 cursor-pointer hover:shadow-md hover:shadow-gray-300 hover:translate-y-[-1px]"} text-[14px] font-medium rounded-[3px] px-3 py-1 text-white flex justify-center items-center h-fit ${fullWidth ? "w-full" : "w-fit"}`}
            onClick={onClickFn && ((e) => !deactive && onClickFn(e))}>
            {btnText}
        </button>
    );
}

export default ButtonDarkMid;