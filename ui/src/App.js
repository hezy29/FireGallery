// Photo album
import React, { useState, useCallback } from "react";
// import { render } from "react-dom";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import { photos } from "./data/photos";
import { AddPhoto, DeletePhoto } from "./chatgpt-modify";
import axios from "axios";

function App() {
    // Login
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = async (email, password) => {
        // Here we would normally send the login request to a server and handle the response
        // For now, we'll just assume the login was successful
        // setIsLoggedIn(true);
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                setIsLoggedIn(true);
            } else {
                console.log('Login failed:', response.data.message);
            }
        } catch (error) {
            console.log('Login error:', error.message);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const LoginForm = () => {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        const handleSubmit = (event) => {
            event.preventDefault();
            handleLogin(email, password);
        };

        return (
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <label>Password:</label>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <button type="submit">Login</button>
            </form>
        );
    };



    // SortbyTime
    const [sortOrder, setSortOrder] = useState("desc");

    const sortedPhotos = [...photos].sort((a, b) => {
        return sortOrder === "asc" ? a.time - b.time : b.time - a.time;
    });

    const handleSortChange = (event) => {
        const value = event.target.value;
        setSortOrder(value.split("-")[1]);
    };


    // Lightbox
    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);

    const openLightbox = useCallback((event, { photo, index }) => {
        setCurrentImage(index);
        setViewerIsOpen(true);
    }, []);

    const closeLightbox = () => {
        setCurrentImage(0);
        setViewerIsOpen(false);
    };




    return (
        <div>
            {/* Header of Album webpage */}
            <header className="App-header">
                <h1 className="App-title">My Photos</h1>
                {isLoggedIn ? (
                    <button onClick={handleLogout}>Log Out</button>
                ) : null}
            </header>


            {/* Album */}
            {isLoggedIn ? (
                <main>
                    <div className="SortByContainer">
                        <label htmlFor="sort-by-select">Sort By:</label>
                        <select id="sort-by-select" onChange={handleSortChange}>
                            <option value="time-desc">Time (Newest First)</option>
                            <option value="time-asc">Time (Oldest First)</option>
                        </select>
                    </div>
                    <Gallery photos={sortedPhotos} onClick={openLightbox} />
                    <ModalGateway>
                        {viewerIsOpen ? (
                            <Modal onClose={closeLightbox}>
                                <Carousel
                                    currentIndex={currentImage}
                                    views={photos.map(x => ({
                                        ...x,
                                        srcset: x.srcSet,
                                        caption: x.title
                                    }))}
                                />
                            </Modal>
                        ) : null}
                    </ModalGateway>
                </main>) : (
                <div className="LoginFormContainer">
                    <LoginForm onLogin={handleLogin} />
                </div>
            )}

            {/* test area */}
            <AddPhoto />
            <DeletePhoto />

        </div>
    );
}
// render(<App />, document.getElementById("app"));
export default App;
