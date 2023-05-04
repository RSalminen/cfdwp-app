

const WhiteOverlay = (props:React.PropsWithChildren<{onClickOutside?:Function}>) => {

    const {children, onClickOutside} = props;

    const outsideClicked = (e:React.MouseEvent) => {
        if (!onClickOutside) return;
        
        if (e.currentTarget !== e.target) return;


        e.preventDefault();

        onClickOutside();
    }

    return (
        <div onClick={outsideClicked} className="fade-in-card-fast fixed z-[999] top-0 left-0 w-full h-full bg-white bg-opacity-90 flex justify-center items-center">
            {children}    
        </div>
    )
}

export default WhiteOverlay;