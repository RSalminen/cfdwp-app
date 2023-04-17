import ReactSwitch from "react-switch";

const ToggleSwitch = ({isActive, onChangeFn} : {isActive:boolean, onChangeFn:Function}) => {

    return (

        <div className="flex space-x-1 items-center">
            
            <span className="mb-0.5">Shadow</span>
            <ReactSwitch
            onChange={() => onChangeFn()}
            checked={isActive}
            className="align-middle"
            height={18}
            width={36}
            />
        </div>


    );
}

export default ToggleSwitch;