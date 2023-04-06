import { Link } from "react-router-dom";

const SmallButtonDarkLink = ({btnText, url, fullWidth=false}:{btnText:string, url:string, fullWidth?:boolean}) => {

    return (
        <Link to={url} className={`bg-emerald-900 rounded-[3px] px-1.5 py-0.5 sm:px-3 sm:py-1 text-[12px] font-medium text-white flex justify-center items-center hover:cursor-pointer ${fullWidth && "w-full"}`}>
            {btnText}
        </Link>
    );
}

export default SmallButtonDarkLink;