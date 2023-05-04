import { useState, useEffect } from "react";
import { storage, firestore } from '../firebase/config';
// Retrieve Storage Reference
import { ref as sRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { collection, addDoc, Timestamp } from 'firebase/firestore';


const useStorage = (file, { user }) => {

    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);

    useEffect(() => {
        // references
        const storageRef = sRef(storage, file.name);
        // const collectionRef = firestore.collection('images');
        const collectionRef = collection(firestore, 'images');

        const uploadTask = uploadBytesResumable(storageRef, file);

        console.log(user);

        uploadTask.on('state_changed',
            (snap) => {
                let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
                // console.log('Upload is ' + percentage + '% done');
                setProgress(percentage);
            }, (err) => {
                setError(err);
            }, async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                const createdat = Timestamp.fromDate(new Date());
                const uid = user.uid;
                const image = new Image();
                image.src = URL.createObjectURL(file);
                // collectionRef.add({ url, createdAt });
                image.onload = () => {
                    addDoc(collectionRef, { src: url, createdat, width: image.naturalWidth, height: image.naturalHeight, uid });
                    setUrl(url);
                };
            })
    }, [file, user]);

    return { progress, url, error }
}

export default useStorage;