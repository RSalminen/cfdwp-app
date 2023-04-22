const ButtonDarkSmall = ({btnText, onClickFn, fullWidth, deactive=false}:{btnText:string, onClickFn:Function, fullWidth:boolean, deactive?:boolean}) => {

    return (
        <button className={`${deactive ? "bg-gray-700" : "bg-emerald-900 cursor-pointer"} ${fullWidth && "w-full"} rounded-[3px] px-1.5 py-0.5 sm:px-3 sm:py-1 text-[12px] font-medium text-white flex justify-center items-center whitespace-nowrap`}
            onClick={(e) => !deactive && onClickFn(e)}>
            {btnText}
        </button>
    );
}


export default ButtonDarkSmall;