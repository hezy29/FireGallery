import React, { useState } from "react";
import axios from "axios";

function AddPhoto({ setPhotos }) {
    const [title, setTitle] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [url, setUrl] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/photos", {
                title,
                thumbnailUrl,
                url,
            });
            setPhotos((photos) => [...photos, data]);
            setTitle("");
            setThumbnailUrl("");
            setUrl("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="add-photo">
            <h3>Add a new photo</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-control">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="thumbnailUrl">Thumbnail URL:</label>
                    <input
                        type="text"
                        id="thumbnailUrl"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        required
                    />
                </div>
                <div className="form-control">
                    <label htmlFor="url">Image URL:</label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Add Photo</button>
            </form>
        </div>
    );
}

function DeletePhoto({ photo, setPhotos }) {
    const handleDelete = async () => {
        try {
            await axios.delete(`/api/photos/${photo._id}`);
            setPhotos((photos) => photos.filter((p) => p._id !== photo._id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <button className="delete-photo" onClick={handleDelete}>
            Delete
        </button>
    );
}

export { AddPhoto, DeletePhoto };
