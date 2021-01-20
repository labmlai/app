import {useState, useEffect} from "react"

const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({x: null, y: null})

    function updateMousePosition(ev: any) {
        setMousePosition({x: ev.clientX, y: ev.clientY})
    }

    useEffect(() => {
        window.addEventListener("mousemove", updateMousePosition)

        return () => window.removeEventListener("mousemove", updateMousePosition)
    }, []);

    return mousePosition
};

export default useMousePosition