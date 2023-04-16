const ViewerLoadingScreen = ({loadProgress} : { loadProgress:number}) => {

    return (
      <div className="flex flex-col absolute z-[99] w-full h-full bg-black justify-center items-center text-white">
        <h4 className="text-semibold text-[24px]">Loading</h4>
        <div className="border-b mt-16 relative w-[80%] max-w-[600px] bg-black">
          <img className="w-full" src="/loading.svg" alt="Loading bar" />
          <div style={{width: `${100-loadProgress}%`}} className={`absolute h-full top-0 right-0 bg-black`}></div>
        </div>
        <p className="my-2">{loadProgress}%</p>
      </div>
    )
}

export default ViewerLoadingScreen;