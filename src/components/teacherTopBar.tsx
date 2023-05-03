import BaseLogo from '../assets/cfdviewerlogo.svg'

const TeacherTopBar = ({teacherid} : {teacherid:string}) => {
    return (

        <div className="py-2 flex items-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
            <div className="flex justify-between w-[85%] m-auto items-center">
                <img width={220} src={BaseLogo} alt="CFD Viewer logo" />
            </div>
        </div>

    );
}

export default TeacherTopBar;