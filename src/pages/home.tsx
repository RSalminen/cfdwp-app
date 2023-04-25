import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'
import { useEffect, useRef, useState } from 'react';
import { fileService } from '../services/fileService';
import LoadingSpinner from '../components/uiComponents/loadingSpinner';
import SearchBar from '../components/uiComponents/searchBar';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import WhiteOverlay from '../components/uiComponents/whiteOverlay';


interface ISimCard {
  simtitle: string;
  filetype: number;
  id: string;
}

interface ICollCard {
  name: string;
  id: string;
  file_ids: number[];
}

const SingleCard = ({title, type}:{title:string, type:number}) => {
  return (
    <div className="flex flex-col h-32 w-52 sm:h-36 sm:w-60 m-2 rounded-md md:cursor-pointer md:hover:-translate-y-2 transition-all">
      <div className="h-[60%] w-full rounded-t-md bg-gray-200 flex justify-center items-center">
        {type===1 ?
          <svg className="h-8 w-8 fill-gray-600" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M113.5 281.2v85.3L256 448l142.5-81.5v-85.3L256 362.7l-142.5-81.5zM256 64L32 192l224 128 183.3-104.7v147.4H480V192L256 64z"></path></svg>
          : <svg className="h-6 w-6 fill-gray-600" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="10" rx="1.5" transform="matrix(1 0 0 -1 0 14.5)"></rect><path fillRule="evenodd" d="M2 3a.5.5 0 00.5.5h11a.5.5 0 000-1h-11A.5.5 0 002 3zm2-2a.5.5 0 00.5.5h7a.5.5 0 000-1h-7A.5.5 0 004 1z" clipRule="evenodd"></path></svg>
          }    
      </div>
      <div className="flex justify-center items-center bg-white px-2 h-[40%] border-x border-b rounded-b-md w-full overflow-hidden text-center">
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
  const fitCount = useRef<number>();

  const simulations = useRef<ISimCard[]>([]);
  const collections = useRef<ICollCard[]>([]);

  const [simsToShow, setSimsToShow] = useState<number>();
  const [collsToShow, setCollsToShow] = useState<number>();

  const [simShowmoreVisible, setSimShowmoreVisible] = useState<boolean>(true);
  const [collShowmoreVisible, setCollShowmoreVisible] = useState<boolean>(true);

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const [searchedSimulations, setSearchedSimulations] = useState<ISimCard[] | null>(null);
  const [searchedCollections, setSearchedCollections] = useState<ICollCard[] | null>(null);

  const [openCollection, setOpenCollection] = useState<ICollCard | null>(null);

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
    
    simulations.current = scrambledSims;
    collections.current = scrambledColls;
  }

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
      const cardSize = isMobile ? 224 : 256;
      const {width} = simCardRef.current.getBoundingClientRect();
      const totalwidth = width - 40;

      const calculatedCount = Math.floor(totalwidth / cardSize);

      
      if (calculatedCount < 3) fitCount.current = 4;
      else fitCount.current = calculatedCount;

      setSimsToShow(fitCount.current);
      setCollsToShow(fitCount.current);
    }
  }, [bgLoaded]);

  const getSearchFit = () => {

    const cardSize = isMobile ? 224 : 256;
    const arrowSize = isMobile ? 48 : 64;
    const paddingSize = isMobile ? 30 : 80;

    const { width } = simCardRef.current.getBoundingClientRect();
    const totalwidth = width - paddingSize - arrowSize;

    const calculatedCount = Math.floor(totalwidth / cardSize);

    if (calculatedCount === 0) return 1;

    return calculatedCount;
  }

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

  const searchSimulations = (str:string) => {
    setSearchedSimulations(simulations.current.filter((item:ISimCard) => item.simtitle.toLowerCase().startsWith(str.toLowerCase())));
    //setSearchedSimulations(simulations.current.filter((item:ISimCard) => 1===1));
  }

  const searchCollections = (str:string) => {
    setSearchedCollections(collections.current.filter((item:ICollCard) => item.name.toLowerCase().startsWith(str.toLowerCase())));
  }

  const group = (items:any, n:number) => items.reduce((acc:any, x:any, i:any) => {
    const idx = Math.floor(i / n);
    acc[idx] = [...(acc[idx] || []), x];
    return acc;
  }, []);

  return (
    <>
    <div className={`h-full w-full ${openCollection && "overflow-hidden"}`}>

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
            
            <div ref={simCardRef} className="fade-in-card overflow-x-auto w-full bg-white shadow-md shadow-gray-600 rounded-md px-5 py-4 flex flex-col space-y-6 items-center sm:items-start">
              
              <div className="flex items-center justify-center md:justify-between w-full flex-wrap">
                <h3 className="text-[18px] md:text-[22px] font-semibold px-5">Simulations</h3>
                <div className="px-5"><SearchBar placeholder="Search simulations..." onSearch={searchSimulations} /></div>
              </div>

              {(searchedSimulations !== null && dataLoaded) &&
              <div className="my-3 border-b w-full flex flex-col bg-gray-50 border pt-2 pb-4 px-1 sm:px-4 rounded-md">
                
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-[15px] sm:text-[17px] text-center sm:text-left">Search Results</h5>
                  <svg className="h-5 w-5 cursor-pointer text-gray-800" onClick={() => setSearchedSimulations(null)} stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M354 671h58.9c4.7 0 9.2-2.1 12.3-5.7L512 561.8l86.8 103.5c3 3.6 7.5 5.7 12.3 5.7H670c6.8 0 10.5-7.9 6.1-13.1L553.8 512l122.4-145.9c4.4-5.2.7-13.1-6.1-13.1h-58.9c-4.7 0-9.2 2.1-12.3 5.7L512 462.2l-86.8-103.5c-3-3.6-7.5-5.7-12.3-5.7H354c-6.8 0-10.5 7.9-6.1 13.1L470.2 512 347.9 657.9A7.95 7.95 0 0 0 354 671z"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path></svg>
                </div>

                <div className="flex items-center">

                  {searchedSimulations!.length > 0 ?
                  <div className="w-full relative">

                    <Carousel showThumbs={false} showIndicators={false} showStatus={false} 
                      renderArrowNext={(onClickHandler:any, hasNext:boolean) => (
                        hasNext && 
                        <div className="absolute z-[3] top-0 right-0 h-full pointer-events-none flex items-center">
                          <svg onClick={onClickHandler} className="pointer-events-auto w-6 h-6 sm:w-8 sm:h-8 text-gray-700 hover:text-gray-500 cursor-pointer" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M210.7 147.6c7.5-7.5 19.8-7.5 27.3 0l95.4 95.7c7.3 7.3 7.5 19.1.6 26.6l-94 94.3c-3.8 3.8-8.7 5.7-13.7 5.7-4.9 0-9.9-1.9-13.6-5.6-7.5-7.5-7.6-19.7 0-27.3l79.9-81.1-81.9-81.1c-7.6-7.4-7.6-19.6 0-27.2z"></path><path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm32 0c0-47 18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432s-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256z"></path></svg>
                        </div>
                      )}
                      renderArrowPrev={(onClickHandler:any, hasPrev:boolean) => (
                        hasPrev && 
                        <div className="absolute z-[3] top-0 left-0 h-full pointer-events-none flex items-center">
                          <svg onClick={onClickHandler} className="pointer-events-auto w-6 h-6 sm:w-8 sm:h-8 text-gray-700 hover:text-gray-500 cursor-pointer rotate-180" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M210.7 147.6c7.5-7.5 19.8-7.5 27.3 0l95.4 95.7c7.3 7.3 7.5 19.1.6 26.6l-94 94.3c-3.8 3.8-8.7 5.7-13.7 5.7-4.9 0-9.9-1.9-13.6-5.6-7.5-7.5-7.6-19.7 0-27.3l79.9-81.1-81.9-81.1c-7.6-7.4-7.6-19.6 0-27.2z"></path><path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm32 0c0-47 18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432s-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256z"></path></svg>
                        </div>
                      )}>
                        
                        {group(searchedSimulations, getSearchFit()).map((groupedSims:ISimCard[], idx:number) => (
                          <div key={idx} className="w-full flex justify-center">

                            {groupedSims.map((simulation) => (
                            
                            <Link to={(simulation.filetype === 2 ? "/viewvti/" : "/view/") + simulation.id} key={simulation.id}>
                              <SingleCard title={simulation.simtitle} type={1} />
                            </Link>
                            ))}

                          </div>
                        
                        ))}
                    </Carousel>
                  </div>
                  :
                  <div className="w-full flex justify-center font-semibold">
                    No results
                  </div>
                  }
                </div>
              </div>
              }

              <div className="flex flex-wrap w-full justify-center">
                {dataLoaded ? simulations.current.slice(0,simsToShow).map((simulation:ISimCard) => (
                  <Link to={(simulation.filetype === 2 ? "/viewvti/" : "/view/") + simulation.id} key={simulation.id}>
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
              <div className="fade-in-card w-full bg-white shadow-md shadow-gray-600 rounded-md px-5 md:px-7 py-4 flex flex-col space-y-6 items-center sm:items-start mb-5">
              
                <div className="flex items-center justify-center md:justify-between w-full flex-wrap">
                  <h3 className="text-[18px] md:text-[22px] font-semibold mx-5">Collections</h3>
                  <div className="mx-5"><SearchBar placeholder="Search collections..." onSearch={searchCollections} /></div>
                </div>

                {(searchedCollections !== null && dataLoaded) &&
                <div className="my-3 border-b w-full flex flex-col bg-gray-50 border pt-2 pb-4 px-1 sm:px-4 rounded-md">
                  
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-[15px] sm:text-[17px] text-center sm:text-left">Search Results</h5>
                    <svg className="h-5 w-5 cursor-pointer" onClick={() => setSearchedCollections(null)} stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M354 671h58.9c4.7 0 9.2-2.1 12.3-5.7L512 561.8l86.8 103.5c3 3.6 7.5 5.7 12.3 5.7H670c6.8 0 10.5-7.9 6.1-13.1L553.8 512l122.4-145.9c4.4-5.2.7-13.1-6.1-13.1h-58.9c-4.7 0-9.2 2.1-12.3 5.7L512 462.2l-86.8-103.5c-3-3.6-7.5-5.7-12.3-5.7H354c-6.8 0-10.5 7.9-6.1 13.1L470.2 512 347.9 657.9A7.95 7.95 0 0 0 354 671z"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path></svg>
                  </div>
                  
                  <div className="flex items-center">
                    
                    {searchedCollections!.length > 0 ?
                    <div className="w-full relative">

                      <Carousel showThumbs={false} showIndicators={false} showStatus={false} 
                        renderArrowNext={(onClickHandler:any, hasNext:boolean) => (
                          hasNext && 
                          <div className="absolute z-[3] top-0 right-0 h-full pointer-events-none flex items-center">
                            <svg onClick={onClickHandler} className="pointer-events-auto w-6 h-6 sm:w-8 sm:h-8 text-gray-700 hover:text-gray-500 cursor-pointer" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M210.7 147.6c7.5-7.5 19.8-7.5 27.3 0l95.4 95.7c7.3 7.3 7.5 19.1.6 26.6l-94 94.3c-3.8 3.8-8.7 5.7-13.7 5.7-4.9 0-9.9-1.9-13.6-5.6-7.5-7.5-7.6-19.7 0-27.3l79.9-81.1-81.9-81.1c-7.6-7.4-7.6-19.6 0-27.2z"></path><path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm32 0c0-47 18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432s-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256z"></path></svg>
                          </div>
                        )}
                        renderArrowPrev={(onClickHandler:any, hasPrev:boolean) => (
                          hasPrev && 
                          <div className="absolute z-[3] top-0 left-0 h-full pointer-events-none flex items-center">
                            <svg onClick={onClickHandler} className="pointer-events-auto w-6 h-6 sm:w-8 sm:h-8 text-gray-700 hover:text-gray-500 cursor-pointer rotate-180" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M210.7 147.6c7.5-7.5 19.8-7.5 27.3 0l95.4 95.7c7.3 7.3 7.5 19.1.6 26.6l-94 94.3c-3.8 3.8-8.7 5.7-13.7 5.7-4.9 0-9.9-1.9-13.6-5.6-7.5-7.5-7.6-19.7 0-27.3l79.9-81.1-81.9-81.1c-7.6-7.4-7.6-19.6 0-27.2z"></path><path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm32 0c0-47 18.3-91.2 51.6-124.4C164.8 98.3 209 80 256 80s91.2 18.3 124.4 51.6C413.7 164.8 432 209 432 256s-18.3 91.2-51.6 124.4C347.2 413.7 303 432 256 432s-91.2-18.3-124.4-51.6C98.3 347.2 80 303 80 256z"></path></svg>
                          </div>
                        )}>
                          
                          {group(searchedCollections, getSearchFit()).map((groupedColls:ICollCard[], idx:number) => (
                            <div key={idx} className="w-full flex justify-center">

                              {groupedColls.map((collection) => (
                              
                              <div onClick={() => setOpenCollection(collection)}>
                                <SingleCard key={collection.id} title={collection.name} type={2} />
                              </div>
                              ))}

                            </div>
                          
                          ))}
                      </Carousel>
                    </div>
                    :
                    <div className="w-full flex justify-center font-semibold">
                      No results
                    </div>
                    }
                  </div>
                </div>
                }

                <div className="flex flex-wrap w-full justify-center">
                  {dataLoaded ? collections.current.slice(0, collsToShow).map((collection:ICollCard) => (
                  <div onClick={() => setOpenCollection(collection)}>
                    <SingleCard key={collection.id} title={collection.name} type={2} />
                  </div>
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

    {/* Collection simulations list */}
    {(openCollection && openCollection.file_ids && openCollection.file_ids.length > 0) &&
      <WhiteOverlay>
        <div className="bg-white py-3 m-2 px-4 sm:px-10 border rounded-md max-w-[600px] max-h-[80%] overflow-y-auto overflow-x-hidden relative">
        <svg onClick={() => setOpenCollection(null)} className="absolute top-[10px] right-3 sm:right-2 h-[14px] w-[14px] cursor-pointer" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
          <div className="flex flex-col space-y-3 items-center">
            <h3 className="font-semibold">{openCollection.name}</h3>
            
            <div className="flex flex-col w-full items-center">
              {openCollection.file_ids.map((fileId:number) => {
                const sim : ISimCard | undefined = simulations.current.find((sim) => (parseInt(sim.id) === fileId))
                
                if (!sim) return null;

                return (
                    <div className="w-fit max-w-full px-2 py-1 text-[13px] font-medium">
                      <Link to={(sim.filetype === 2 ? "/viewvti/" : "/view/") + sim.id} key={sim.id}>
                        <p className="max-w-full break-words two-lines text-center hover:text-emerald-800">{sim.simtitle}</p>
                      </Link>
                    </div>
                )
              })}
            </div>
          </div>
        </div>
      </WhiteOverlay>
    }
    </>
  );
}

export default Home;