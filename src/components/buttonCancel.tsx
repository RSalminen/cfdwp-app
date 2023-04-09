const ButtonCancel = ({btnText, onClickFn}:{btnText:string, onClickFn:Function}) => {

    return (
        <div className="w-full flex justify-center items-center">
            <button className="border-b-2 border-gray-700" onClick={(e) => onClickFn(e)}>
                {btnText}
            </button>
        </div>
    );
}

export default ButtonCancel;