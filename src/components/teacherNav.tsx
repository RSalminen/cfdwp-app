import { Link } from "react-router-dom";

const TeacherNav = ({currentPage, teacherid} : {currentPage:number, teacherid:string}) => {
    const routes = [
        {name: "My Simulations", route: `/teacher/${teacherid}`},
        {name: "My Collections", route: `/teacher/${teacherid}/collections`},
        {name: "Post Simulation", route: `/teacher/${teacherid}/addfile`},
        {name: "Add Collection", route: `/teacher/${teacherid}/addcollection`}
    ]
    
    return (
        <div className="w-full h-14 flex justify-center bg-gradient-to-r from-gray-100 via-gray-100 to-emerald-100">
            <div className="w-[80%] h-full flex space-x-10 items-center text-[14px] font-semibold">
                {routes.map((route:{name:string, route:string}, idx:number) => (
                    currentPage === idx ?
                    <h5 key={route.name} className="border-b-2 border-emerald-800">{route.name}</h5>
                    : <Link key={route.name} to={route.route}>{route.name}</Link>
                ))}
            </div>
        </div>
    )
}

export default TeacherNav;