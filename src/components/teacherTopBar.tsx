
const TeacherTopBar = ({teacherid} : {teacherid:string}) => {
    return (
        <div>
            <div className="h-[60px] flex items-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
                <div className="flex justify-between w-[85%] m-auto items-center">
                    <img width={220} src="/cfdviewernew.svg" alt="CFD Viewer logo" />
                </div>
            </div>
        </div>
    );
}

export default TeacherTopBar;