import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import { useEffect, useState } from 'react';
import Div100vh, { use100vh } from 'react-div-100vh';

const Home = () => {
  
  const isMobile = useMediaQuery({ query: `(max-width: 640px)` });

  const [bgLoaded, setBgLoaded] = useState<boolean>(false);

  const height = use100vh();

  if (!bgLoaded) return (
    <div>
      <img role="presentation" className="hidden h-full w-full fixed object-cover -z-10 top-0 left-0 pointer-events-none" src="wavebg1.svg"/>
      <img className="hidden" width={isMobile ? 200 : 320} src="/cfdviewernew.svg" alt="CFD Viewer logo" onLoad={() => setBgLoaded(true)} />
    </div>
  )

  return (
    <div className="h-full w-full">
      <div className="flex justify-center h-full w-full py-2">
        
        {/* background */}
        <img transition-style="in:wipe:right" role="presentation" className="h-full w-full fixed object-cover -z-10 top-0 left-0 pointer-events-none" src="wavebg1.svg"/>
        <div className="fixed w-full h-full top-0 left-0 -z-[11] backgroundcolor"></div>

        <div className="w-[95%] sm:w-[80%] flex flex-col space-y-44">
          <div className="flex justify-between items-center">

            <img width={isMobile ? 200 : 320} src="/cfdviewernew.svg" alt="CFD Viewer logo" />

            <Link to="/login">
              <div className="flex flex-row items-center border border-black bg-white bg-opacity-60 px-2 py-1 rounded-sm text-[14px] sm:text-[16px] font-medium">
                <p>Login</p>
                <svg className="h-5 w-5" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 16L18 12 13 8 13 11 4 11 4 13 13 13z"></path><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z"></path></svg>
              </div>
            </Link>
          </div>

          <div className="flex-grow">
            <div className="fade-in-card w-full bg-white shadow-md shadow-gray-600 rounded-md px-7 py-4 flex flex-col space-y-4 items-center sm:items-start">
              <h3 className="text-[22px] font-semibold">
                Simulations
              </h3>
              <div className="flex flex-wrap">
                <div className="flex flex-col h-36 w-60 sm:h-32 sm:w-52 border rounded-md md:hover:cursor-pointer md:hover:-translate-y-2 transition-all">
                  <div className="h-[60%] w-full bg-gray-200 flex justify-center items-center">
                    <svg className="h-8 w-8 fill-gray-600" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M113.5 281.2v85.3L256 448l142.5-81.5v-85.3L256 362.7l-142.5-81.5zM256 64L32 192l224 128 183.3-104.7v147.4H480V192L256 64z"></path></svg>
                  </div>
                  <div className="flex justify-center items-center px-2 h-[40%] w-full overflow-hidden text-center">
                    <p className='text-[14px] inline-block break-words w-full font-medium'>This is a simulation</p>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-center text-center items-center space-x-1 text-blue-900 hover:cursor-pointer">
                <p>Show more</p>
                <svg className="h-[14px] w-[14px] mt-0.5" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;