import { useState } from "react";

const SearchBar = ({placeholder, onSearch} : {placeholder:string, onSearch:Function}) => {

    const [searchString, setSearchString] = useState<string>('');

    const searchClicked = (e:React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        onSearch(searchString);

        setSearchString("");
        
    }

    return (

        <form onSubmit={searchClicked} className="relative text-[13px] md:text-[16px] w-full"> 
            <div className="absolute z-[2] px-2 w-full h-full flex items-center pointer-events-none">
                <svg className="h-5 w-5 mt-0.5 text-gray-500" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path></svg>
            </div>
            
            <input maxLength={30} type="text" value={searchString} onChange={(e) => setSearchString(e.target.value)} className="w-full h-10 md:h-12 pl-8 md:pl-10 pr-14 md:pr-24 rounded-lg z-0 focus:shadow focus:outline-none bg-gray-100" placeholder={placeholder} required minLength={2} />
            
            <div className="absolute z-[2] px-1.5 top-0 w-full h-full pointer-events-none flex justify-end items-center">
                
                <input type="submit" className="cursor-pointer h-8 w-16 md:w-20 md:h-[36px] text-white rounded-md bg-blue-800 hover:bg-blue-700 active:bg-blue-900 pointer-events-auto" value="Search" />
                
            </div>
        </form>


    );
}

export default SearchBar;