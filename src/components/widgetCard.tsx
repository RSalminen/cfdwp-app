import { IWidget } from "../types";
import ButtonDarkMid from "./uiComponents/buttonDarkMid";

const WidgetCard = ({widgets, currentWidgetNr, changeWidgetFn, setWidgetOpen} : {widgets:IWidget[], currentWidgetNr:number, changeWidgetFn:Function, setWidgetOpen:React.Dispatch<React.SetStateAction<boolean>>}) => {

    const widget = widgets[currentWidgetNr];
    return (
        <div className="h-full w-full">
            <div className="absolute z-[9] top-1 right-2 flex space-x-0.5 items-center">
                <svg className="widgetHandle h-5 w-5 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"></path></svg>
                <svg onClick={() => setWidgetOpen(false)} className="h-4 w-4 cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
            </div>
            <div className="flex flex-col justify-between h-full pt-5 pb-2">   
                <div className="flex flex-col w-full px-2">
                    {widget.title.length > 0 && <h5 className="text-[17px] font-semibold text-center">{widget.title}</h5>}
                    <p className="text-[14px] text-center">{widget.description}</p>
                </div>
  
                <div className="flex space-x-2 px-2 justify-between">
                    {currentWidgetNr===0
                    ? <ButtonDarkMid btnText="To beginning" fullWidth={false} onClickFn={() => {}} deactive={true} />
                    : <ButtonDarkMid btnText="To beginning" fullWidth={false} onClickFn={() => changeWidgetFn(0)} />
                    }
                    <div className="text-[17px] font-semibold">{currentWidgetNr+1}/{widgets.length}</div>
                    
                    {currentWidgetNr===widgets.length-1
                    ? <ButtonDarkMid btnText="Next note" fullWidth={false} onClickFn={() => {}} deactive={true} />
                    : <ButtonDarkMid btnText="Next note" fullWidth={false} onClickFn={() => changeWidgetFn(currentWidgetNr + 1)} />
                    }
                </div>
            </div>
        </div>
    )
}

export default WidgetCard;