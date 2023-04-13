import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import { useEffect, useRef, useState } from 'react';
import { fileService } from '../services/fileService';
import LoadingSpinner from '../components/loadingSpinner';


interface ISimCard {
  simtitle: string;
  filetype: number;
  id: string;
}

interface ICollCard {
  name: string;
  id: string;
}

const SingleCard = ({title, type}:{title:string, type:number}) => {
  return (
    <div className="flex flex-col h-36 w-60 sm:h-32 sm:w-52 m-2 rounded-md md:cursor-pointer md:hover:-translate-y-2 transition-all">
      <div className="h-[60%] w-full rounded-t-md bg-gray-200 flex justify-center items-center">
        {type===1 ?
          <svg className="h-8 w-8 fill-gray-600" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M113.5 281.2v85.3L256 448l142.5-81.5v-85.3L256 362.7l-142.5-81.5zM256 64L32 192l224 128 183.3-104.7v147.4H480V192L256 64z"></path></svg>
          : <svg className="h-6 w-6 fill-gray-600" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="10" rx="1.5" transform="matrix(1 0 0 -1 0 14.5)"></rect><path fillRule="evenodd" d="M2 3a.5.5 0 00.5.5h11a.5.5 0 000-1h-11A.5.5 0 002 3zm2-2a.5.5 0 00.5.5h7a.5.5 0 000-1h-7A.5.5 0 004 1z" clipRule="evenodd"></path></svg>
          }    
      </div>
      <div className="flex justify-center items-center px-2 h-[40%] border-x border-b rounded-b-md w-full overflow-hidden text-center">
        <p className='text-[14px] inline-block w-full two-lines font-medium'>{title}</p>
      </div>
    </div>
  )
}

const ShowMore = ({isVisible, showMoreClick, showLessClick}:{isVisible:boolean, showMoreClick:Function, showLessClick:Function}) => {

  return (
    <div className="w-full flex justify-center transition-all">
      {isVisible ?
      <div onClick={() => showMoreClick()} className="flex items-center text-center space-x-1 text-blue-900 cursor-pointer">
        <p className="text-[13px]">Show more</p>
        <svg className="h-[12px] w-[12px] mt-0.5" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path></svg>
      </div>
      :
      <div onClick={() => showLessClick()} className="flex items-center text-center space-x-1 text-blue-900 cursor-pointer">
        <p className="text-[13px]">Show less</p>
        <svg className="h-[12px] w-[12px] mt-0.5 rotate-180" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"></path></svg>
      </div>
      }
  </div>
  )
}


const Home = () => {
  
  const isMobile = useMediaQuery({ query: `(max-width: 640px)` });
  const startEffectRun = useRef<boolean>(false);

  
  const simCardRef = useRef<any>();

  const [bgLoaded, setBgLoaded] = useState<boolean>(false);
  const [simulations, setSimulations] = useState<ISimCard[]>([]);
  const [collections, setCollections] = useState<ICollCard[]>([]);

  const [simsToShow, setSimsToShow] = useState<number>();
  const [collsToShow, setCollsToShow] = useState<number>();

  const [simShowmoreVisible, setSimShowmoreVisible] = useState<boolean>(true);
  const [collShowmoreVisible, setCollShowmoreVisible] = useState<boolean>(true);

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const scrambleList = (oldList:ISimCard[] | ICollCard[]) => {
    for (var i = oldList.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = oldList[i];
      oldList[i] = oldList[j];
      oldList[j] = temp;
    }

    return oldList;
  }

  const loadSims = async () => {
    const data : {sims:ISimCard[], colls:ICollCard[]} = await fileService.getAllSims();

    const scrambledSims = scrambleList(data.sims) as ISimCard[];
    const scrambledColls = scrambleList(data.colls) as ICollCard[];

    setDataLoaded(true);
    
    setSimulations(scrambledSims);
    setCollections(scrambledColls);
  }

  //const height = use100vh();

  //Load the content at startup
  useEffect(() => {
    if (!startEffectRun.current) {
      loadSims();
    }
    return () => {startEffectRun.current = true;}

  }, []);

  //Calculating at startup how many cards can fit in one row
  useEffect(() => {
    if (bgLoaded) {
      const {width} = simCardRef.current.getBoundingClientRect();
      const totalwidth = width - 40;
      let fitCount = Math.floor(totalwidth / 224);
      
      if (fitCount < 3) fitCount = 4;

      setSimsToShow(fitCount);
      setCollsToShow(fitCount);
    }
  }, [bgLoaded]);

  const showMoreSims = () => {
    setSimShowmoreVisible(false);
    setSimsToShow(simsToShow!*2);
  }

  const showLessSims = () => {
    setSimShowmoreVisible(true);
    setSimsToShow(simsToShow!/2);
  }

  const showMoreColls = () => {
    setCollShowmoreVisible(false);
    setCollsToShow(collsToShow!*2);
  }

  const showLessColls = () => {
    setCollShowmoreVisible(true);
    setCollsToShow(collsToShow!/2);
  }

  if (!bgLoaded) return (
    <div>
      <img role="presentation" className="hidden h-full w-full fixed object-cover -z-10 top-0 left-0 pointer-events-none" src="wavebg1.svg"/>
      <img className="hidden" width={isMobile ? 200 : 280} src="/cfdviewerlogo.svg" alt="CFD Viewer logo" onLoad={() => setBgLoaded(true)} />
    </div>
  )

  return (
    <div className="h-full w-full">
      <div className="flex justify-center h-full w-full py-2">
        
        {/* background */}
        <img transition-style="in:wipe:right" role="presentation" className="h-full w-full fixed object-cover -z-10 top-0 left-0 pointer-events-none" src="wavebg1.svg"/>
        <div className="fixed w-full h-full top-0 left-0 -z-[11] backgroundcolor"></div>

        <div className="w-[90%] sm:w-[80%] flex flex-col space-y-20 mb-4">
          <div className="flex justify-between items-center">

            <img width={isMobile ? 200 : 280} src="/cfdviewerlogo.svg" alt="CFD Viewer logo" />

            {/* Login button */}
            <Link to="/login">
              <div className="flex flex-row items-center border border-black bg-white bg-opacity-60 px-2 py-1 rounded-sm text-[14px] sm:text-[16px] font-medium">
                <p>Login</p>
                <svg className="h-5 w-5" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 16L18 12 13 8 13 11 4 11 4 13 13 13z"></path><path d="M20,3h-9C9.897,3,9,3.897,9,5v4h2V5h9v14h-9v-4H9v4c0,1.103,0.897,2,2,2h9c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z"></path></svg>
              </div>
            </Link>
          </div>

          {/* Simulations card */}
          <div className="flex-grow flex flex-col space-y-6 items-center">
            
            <div ref={simCardRef} className="fade-in-card w-full bg-white shadow-md shadow-gray-600 rounded-md px-5 py-4 flex flex-col space-y-4 items-center sm:items-start">
              <h3 className="text-[18px] md:text-[22px] font-semibold">
                Simulations
              </h3>
              <div className="flex flex-wrap w-full justify-center">
                {dataLoaded ? simulations.slice(0,simsToShow).map((simulation:ISimCard) => (
                  <Link to={simulation.filetype === 2 ? "/viewvti/" : "/view/" + simulation.id} key={simulation.id}>
                    <SingleCard title={simulation.simtitle} type={1} />
                  </Link>))
                : <div className="h-36 w-36 p-6">
                    <LoadingSpinner />
                  </div>}
              </div>
              <ShowMore isVisible={simShowmoreVisible} showMoreClick={showMoreSims} showLessClick={showLessSims} />
            
            </div>

            <div className="w-full pb-1.5">
              {/* Collections card */}
              <div className="fade-in-card w-full bg-white shadow-md shadow-gray-600 rounded-md px-5 md:px-7 py-4 flex flex-col space-y-4 items-center sm:items-start mb-5">
                <h3 className="text-[18px] md:text-[22px] font-semibold">
                  Collections
                </h3>
                <div className="flex flex-wrap w-full justify-center">
                  {dataLoaded ? collections.slice(0, collsToShow).map((collection:ICollCard) => (
                  <SingleCard key={collection.id} title={collection.name} type={2} />
                  ))
                  : <div className="h-36 w-36 p-6">
                      <LoadingSpinner />
                    </div>}
                </div>
                <ShowMore isVisible={collShowmoreVisible} showMoreClick={showMoreColls} showLessClick={showLessColls} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;