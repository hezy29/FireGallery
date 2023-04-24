import React, { useState } from "react";
import "./App.css";
import photosData from "./data/photosData";

function App() {
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const photos = photosData.map((photo) => ({
    id: photo.id,
    timestamp: new Date(photo.time),
    thumbnailUrl: photo.thumbnailUrl,
    imageUrl: photo.imageUrl,
  }));

  const sortedPhotos = [...photos].sort((a, b) => {
    if (sortBy === "time") {
      return sortOrder === "asc"
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp;
    } else {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    }
  });

  const handlePhotoClick = (id) => {
    setSelectedPhotoId(id);
  };

  const handleClosePhoto = () => {
    setSelectedPhotoId(null);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === "time-asc" || value === "time-desc") {
      setSortBy("time");
      setSortOrder(value.split("-")[1]);
    } else {
      setSortBy("id");
      setSortOrder(value.split("-")[1]);
    }
  };

  const handleLogin = (email, password) => {
    // Here we would normally send the login request to a server and handle the response
    // For now, we'll just assume the login was successful
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  function LoginForm({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
      onLogin(email, password);
    };

    return (
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit">Log In</button>
      </form>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">My Photos</h1>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Log Out</button>
        ) : null}
      </header>
      {isLoggedIn ? (
        <main className="App-main">
          <div className="SortByContainer">
            <label htmlFor="sort-by-select">Sort By:</label>
            <select id="sort-by-select" onChange={handleSortChange}>
              <option value="time-desc">Time (Newest First)</option>
              <option value="time-asc">Time (Oldest First)</option>
              <option value="id-asc">ID (Smallest First)</option>
              <option value="id-desc">ID (Largest First)</option>
            </select>
          </div>
          <div className="PhotoGrid">
            {sortedPhotos.map((photo) => (
              <div key={photo.id}
                className="PhotoGridItem"
                onClick={() => handlePhotoClick(photo.id)}
              >
                <img src={photo.thumbnailUrl} alt={photo.id} />
              </div>
            ))}
          </div>
          {selectedPhotoId !== null ? (
            <div className="PhotoViewerOverlay">
              <div className="PhotoViewer">
                <button className="CloseButton" onClick={handleClosePhoto}>
                  &times;
                </button>
                <img
                  className="PhotoViewerImage"
                  src={
                    photos.find((photo) => photo.id === selectedPhotoId)
                      .imageUrl
                  }
                  alt={selectedPhotoId}
                />
              </div>
            </div>
          ) : null}
        </main>
      ) : (
        <div className="LoginFormContainer">
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
    </div>
  );
}

export default App;

