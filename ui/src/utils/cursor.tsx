import {useState, useEffect} from "react"

const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    function updateMousePosition(ev: MouseEvent) {
        setMousePosition({x: ev.clientX, y: ev.clientY})
    }

    useEffect(() => {
        window.addEventListener("mousemove", updateMousePosition)

        return () => window.removeEventListener("mousemove", updateMousePosition)
    }, []);

    return mousePosition
};

export default useMousePosition