
const WhiteOverlay = (props:React.PropsWithChildren) => {

    return (
        <div className="fade-in-card-fast fixed z-[999] top-0 left-0 w-full h-full bg-white bg-opacity-90 flex justify-center items-center">
            {props.children}
        </div>
    )
}

export default WhiteOverlay;