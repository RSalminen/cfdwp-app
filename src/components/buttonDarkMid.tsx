
const ButtonDarkMid = ({btnText, onClickFn, fullWidth, deactive=false}:{btnText:string, onClickFn:Function, fullWidth:boolean, deactive?:boolean}) => {

    return (
        <button className={`${deactive ? "bg-gray-700" : "bg-emerald-900 hover:cursor-pointer"} text-[14px] rounded-[3px] px-3 py-1 text-white flex justify-center items-center h-fit ${fullWidth ? "w-full" : "w-fit"}`}
            onClick={(e) => !deactive && onClickFn(e)}>
            {btnText}
        </button>
    );
}


export default ButtonDarkMid;