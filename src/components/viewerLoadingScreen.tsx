const ViewerLoadingScreen = ({loadProgress} : { loadProgress:number}) => {

    return (
      <div className="flex flex-col absolute z-[99] w-full h-full bg-black justify-center items-center text-white">
        <h4 className="text-semibold text-[24px]">Loading</h4>
        <div className="mt-16 relative w-[80%] max-w-[600px] bg-black">
          <div className='w-full h-2 bg-emerald-900 rounded-sm'></div>
          <div style={{width: `${100-loadProgress}%`}} className={`absolute h-full top-0 right-0 bg-gray-700 rounded-sm`}></div>
        </div>
        <p className="my-2">{loadProgress}%</p>

        <div className="pt-10">Powered by vtk.js</div>
      </div>
    )
}

export default ViewerLoadingScreen;