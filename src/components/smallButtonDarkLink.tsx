import { Link } from "react-router-dom";

const SmallButtonDarkLink = ({btnText, url}:{btnText:string, url:string}) => {

    return (
        <Link to={url} className="bg-emerald-900 rounded-[3px] px-1.5 py-0.5 sm:px-3 sm:py-1 text-[12px] text-white flex justify-center items-center hover:cursor-pointer w-fit h-fit">
            {btnText}
        </Link>
    );
}

export default SmallButtonDarkLink;