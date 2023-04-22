const ButtonDark = ({btnText, onClickFn, fullWidth=false, deactive=false}:{btnText:string, onClickFn:Function, fullWidth?:boolean, deactive?:boolean}) => {

    return (
        <button className={`${deactive ? "bg-gray-700 cursor-not-allowed" : "bg-emerald-900"} bg-emerald-900 text-[15px] font-medium rounded-[3px] px-3 py-2 text-white flex justify-center items-center h-fit ${fullWidth ? "w-full" : "w-fit"} whitespace-nowrap`}
        onClick={(e) => onClickFn(e)}>
            {btnText}
        </button>
    );
}

export default ButtonDark;