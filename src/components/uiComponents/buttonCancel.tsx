const ButtonCancel = ({btnText, onClickFn, fullWidth=false, deactive=false}:{btnText:string, onClickFn:Function, fullWidth?:boolean, deactive?:boolean}) => {

    return (
        <div className={`${fullWidth && "w-full flex justify-center items-center"}`}>
            <button className={`${deactive ? "cursor-not-allowed text-gray-500" : "border-b-2 border-gray-700"}`} onClick={(e) => onClickFn(e)}>
                {btnText}
            </button>
        </div>
    );
}

export default ButtonCancel;