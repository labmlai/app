import React, {useEffect} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {LabLoader} from "../components/loader"


function LoginView() {
    const {loginWithRedirect, isAuthenticated, isLoading} = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            loginWithRedirect().then((res) => {
            })
        }
    }, [isLoading])


    return <div>
        <LabLoader isLoading={isLoading}/>
    </div>
}

export default LoginView