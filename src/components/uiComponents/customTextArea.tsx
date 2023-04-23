const CustomTextArea = ({labelText, onChange, currentValue}:{labelText:string, onChange:Function, currentValue:string}) => {

    const stopPropagation = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    }

    return (
        <div className="flex flex-col border-b-2 border-emerald-700 bg-gray-200 pb-1 pt-0.5 rounded-t-sm w-full">
            <h5 className="text-[12px] text-emerald-800 pl-2">{labelText}</h5>
            <textarea className="text-[13px] focus:outline-none bg-gray-200 px-1.5" rows={2}  onChange={(e) => onChange(e)} onKeyPress={stopPropagation} onKeyUp={stopPropagation} onKeyDown={stopPropagation} value={currentValue} />
        </div>
    )
}

export default CustomTextArea;