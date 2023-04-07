const ButtonDark = ({btnText, onClickFn, fullWidth}:{btnText:string, onClickFn:Function, fullWidth:boolean}) => {

    return (
        <button className={`bg-emerald-900 text-[15px] font-medium rounded-[3px] px-3 py-2 text-white flex justify-center items-center cursor-pointer h-fit ${fullWidth ? "w-full" : "w-fit"}`}
        onClick={(e) => onClickFn(e)}>
            {btnText}
        </button>
    );
}

export default ButtonDark;