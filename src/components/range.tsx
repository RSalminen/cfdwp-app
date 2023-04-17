import { Range as ReactRange, getTrackBackground } from 'react-range';


const Range = ({text, value, onChangeFn} : {text:string, value:number, onChangeFn:Function}) => {

    return (
        <div className="flex flex-col items-center space-y-[10px] w-full">
            <label
                className=""
                >{text}</label>
            
            <ReactRange
                values={[value]}
                step={0.05}
                min={0}
                max={1}
                onChange={(values) => onChangeFn(values)}
                renderTrack={({ props, children }) => (
                <div
                    onMouseDown={props.onMouseDown}
                    onTouchStart={props.onTouchStart}
                    style={{
                    ...props.style,
                    display: 'flex',
                    width: '100%'
                    }}
                >
                    <div
                    ref={props.ref}
                    style={{
                        height: '5px',
                        width: '100%',
                        borderRadius: '4px',
                        background: getTrackBackground({
                            values: [value],
                            colors: ['#064e3b', '#ccc'],
                            min: 0,
                            max: 1,
                        }),
                        alignSelf: 'center'
                    }}
                    >
                    {children}
                    </div>
                </div>
                )}
                renderThumb={({ props, isDragged }) => (
                <div
                    {...props}
                    style={{
                    ...props.style,
                    height: '16px',
                    width: '16px',
                    borderRadius: '4px',
                    backgroundColor: '#FFF',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    }}
                >
                    <div
                    style={{
                        height: '8px',
                        width: '2px',
                        backgroundColor: isDragged ? '#064e3b' : '#CCC'
                    }}
                    />
                </div>
                )}
            />
        </div>
    );
}

export default Range;