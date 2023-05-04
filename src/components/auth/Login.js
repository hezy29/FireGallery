import React, { useState } from "react";
import "./login.scss";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth } from "../../firebase/config";


const provider = new GoogleAuthProvider();

const Login = () => {

    const [error, setError] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(true);
                // ..
            });

    }

    const handleRegister = (e) => {
        e.preventDefault();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(true);
                // ..
            });

    }

    // const signInWithGoogle = () => {
    //     signInWithRedirect(auth, provider)
    //         .then((result) => {
    //             // This gives you a Google Access Token. You can use it to access the Google API.
    //             const credential = GoogleAuthProvider.credentialFromResult(result);
    //             const token = credential.accessToken;
    //             // The signed-in user info.
    //             const user = result.user;
    //             // IdP data available using getAdditionalUserInfo(result)
    //             // ...
    //         }).catch((error) => {
    //             // Handle Errors here.
    //             const errorCode = error.code;
    //             const errorMessage = error.message;
    //             // The email of the user's account used.
    //             const email = error.customData.email;
    //             // The AuthCredential type that was used.
    //             const credential = GoogleAuthProvider.credentialFromError(error);
    //             // ...
    //         });
    // }

    return (
        <div className="login">
            <form>
                <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <button type="submit" onClick={handleLogin}>Login</button>
                <span></span>
                <button type="submit" onClick={handleRegister}>Register</button>
                {error && <span>Incorrect email or password</span>}
                {/* <span></span>
                <button onClick={signInWithGoogle}>Sign In with Google</button> */}
            </form>
        </div>
    )
}

export default Login;