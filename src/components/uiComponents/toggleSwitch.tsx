import ReactSwitch from "react-switch";

const ToggleSwitch = ({text, isActive, onChangeFn} : {text:string, isActive:boolean, onChangeFn:Function}) => {

    return (

        <div className="flex space-x-1 items-center">
            
            <span className="mb-0.5 text-[14px]">{text}</span>
            <ReactSwitch
            onChange={() => onChangeFn()}
            checked={isActive}
            height={18}
            width={36}
            />
        </div>


    );
}

export default ToggleSwitch;