import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import "./logout.scss"

const Logout = () => {
    const handleLogout = async () => {
        await signOut(auth);
    }

    return (
        <div className="logout">
            <button onClick={handleLogout}>Sign Out</button>
        </div>
    )
}

export default Logout;