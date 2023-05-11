import React, { useState, useCallback, useEffect } from 'react';
import Title from './components/Title';
import UploadForm from './components/UploadForm';

import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from "react-images";
import useFirestore from './hooks/useFirestore';

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState({});


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(Boolean(currentUser));
    });
    return unsubscribe;
  }, [])

  const { docs } = useFirestore('images', user?.uid);
  console.log("User photos:", docs);

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
    <div className="App">
      <Title />
      {isLoggedIn && user?.uid &&
        <div className='login-page'>
          <Logout />
          <UploadForm user={user} />
          {docs &&
            <div className='gallery'>
              <Gallery photos={docs} onClick={openLightbox} />
              <ModalGateway>
                {viewerIsOpen ? (
                  <Modal onClose={closeLightbox}>
                    <Carousel
                      currentIndex={currentImage}
                      views={docs.map(x => ({
                        ...x,
                        srcset: x.srcSet,
                        caption: x.title
                      }))}
                    />
                  </Modal>
                ) : null}
              </ModalGateway>
            </div>}
        </div>}
      {!isLoggedIn &&
        <div className='logout-page'>
          <Login />
        </div>}


    </div>
  );
}

export default App;
