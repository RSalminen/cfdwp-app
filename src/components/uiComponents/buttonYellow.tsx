const ButtonYellow = ({btnText, onClickFn, fullWidth=false, deactive=false}:{btnText:string, onClickFn:Function, fullWidth?:boolean, deactive?:boolean}) => {

    return (
        <button className={`${deactive ? "bg-gray-700 text-white cursor-not-allowed" : "bg-amber-400 hover:shadow-md hover:shadow-gray-300 hover:translate-y-[-1px] text-black  active:bg-amber-300"} text-[15px] font-medium rounded-[3px] px-3 py-2 flex justify-center items-center h-fit ${fullWidth ? "w-full" : "w-fit"} whitespace-nowrap`}
        onClick={(e) => onClickFn(e)}>
            {btnText}
        </button>
    );
}

export default ButtonYellow;