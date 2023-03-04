import { Link } from 'react-router-dom';

const Home = () => {
  
  return (
    <div className="flex flex-col">
      <div className="h-[9vh] flex items-center border-b border-emerald-700 text-emerald-900">
        <div className="flex justify-between w-[80%] m-auto items-center">
          <h1 className='text-[30px] font-bold font-serif w-[70%]'>CFDWiz</h1>
          <Link to="/login">
            <div className="flex flex-row items-center border border-emerald-700 px-2 py-1 rounded-sm">
              <p>Login</p>
              <svg className="h-5 w-5" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 16L18 12 13 8 13 11 4 11 4 13 13 13z"></path><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z"></path></svg>
            </div>
          </Link>
        </div>
      </div>

      <div className="justify-center md:justify-start w-[90%] md:w-[70%] m-auto my-5">
        CFDWiz helps to visualize simulation results. Click here for more info.
      </div>

      <div className="w-[90%] md:w-[70%] m-auto text-blue-600" >
        <Link to="/view">Open view</Link>
      </div>
    </div>
  )
}

export default Home;