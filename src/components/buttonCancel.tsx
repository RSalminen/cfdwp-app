const ButtonCancel = ({btnText, onClickFn, fullWidth=false}:{btnText:string, onClickFn:Function, fullWidth?:boolean}) => {

    return (
        <div className={`${fullWidth && "w-full flex justify-center items-center"}`}>
            <button className="border-b-2 border-gray-700" onClick={(e) => onClickFn(e)}>
                {btnText}
            </button>
        </div>
    );
}

export default ButtonCancel;