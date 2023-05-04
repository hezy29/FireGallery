import { useState, useEffect } from "react";
import { firestore } from "../firebase/config";
import { collection as collectionRef, orderBy, query, onSnapshot, where } from "firebase/firestore";

const useFirestore = (collection, uid) => {
    const [docs, setDocs] = useState([]);

    // console.log("(Firestore)", uid);

    useEffect(() => {
        let unsub;
        if (uid) {
            unsub = onSnapshot(
                query(collectionRef(firestore, collection),
                    where("uid", "==", uid),
                    orderBy('createdat', 'desc'))
                , (snap) => {
                    let documents = [];
                    snap.forEach(doc => {
                        documents.push({ ...doc.data(), id: doc.id })
                    })
                    setDocs(documents);
                });
        } else {
            setDocs([]);
        }

        return () => unsub && unsub();

    }, [collection, uid])

    return { docs };
}

export default useFirestore;