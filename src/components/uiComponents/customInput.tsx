
const CustomInput = ({labelText, onChange, currentValue, showPassword}:{labelText:string, onChange:Function, currentValue:string, showPassword?:boolean}) => {

    const valueChanged = (e:React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
    }

    const stopPropagation = (e:React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }
    return (
        <div className="flex flex-col border-b-2 border-emerald-700 bg-gray-200 pb-1 pt-0.5 rounded-t-sm w-full">
            <h5 className="text-[12px] text-emerald-800 pl-2">{labelText}</h5>
            <input className="text-[13px] focus:outline-none bg-gray-200 px-1.5 w-full min-w-[100px]" type={showPassword !== false ? "text" : "password"} onKeyPress={stopPropagation} onKeyUp={stopPropagation} onKeyDown={stopPropagation} onChange={valueChanged} value={currentValue} />
        </div>
    )
}

export default CustomInput;