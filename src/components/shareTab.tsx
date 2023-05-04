import {CopyToClipboard} from 'react-copy-to-clipboard';
import ButtonDarkMid from './uiComponents/buttonDarkMid';
import { useState } from 'react';

const ShareTab = ({simId} : {simId:string}) => {

    const [copied, setCopied] = useState<boolean>(false);

    const copyFn = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
    }

    return (
        <>
        <div className="w-full h-full flex flex-col justify-start items-center">
            <p className='pt-3 font-medium'>Url:</p>
            <p className="text-center pb-3">{`https://cfdwp.onrender/view/${simId}`}</p>
            <CopyToClipboard text={`https://cfdwp.onrender/view/${simId}`} onCopy={() => copyFn()}>
                <button className="bg-emerald-900 cursor-pointer hover:shadow-md hover:shadow-gray-300 hover:translate-y-[-1px] text-[14px] font-medium rounded-[3px] px-3 py-1 text-white flex justify-center items-center h-fit">
                    Copy
                </button>
            </CopyToClipboard>
            {copied && 
                <p className="text-[14px] text-emerald-800">Copied to clipboard</p>
            }
        </div>
        </>
    );
}

export default ShareTab;