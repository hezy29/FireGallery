# Project Backend Setup

## Start the MongoDB Service

```
systemctl start mongod
```

## Initialize MongoDB Database
Assume the current working directory is `/.../course-project-project-group-8`

```
mongo album ./scripts/init.mongo.js
```

## Start the Auth Server
Assume the current working directory is `/.../course-project-project-group-8`

```
cd api/auth
nvm install
nvm use
npm install
npm start
```

## Start the Storage Server (in another terminal)
Assume the current working directory is `/.../course-project-project-group-8`

```
cd api/storage
nvm install
nvm use
npm install
npm start
```

## Use the Auth API

Open a browser and enter `http://localhost:5000` in the address bar, and it will automatically redirect to the login page `http://localhost:5000/auth/1` to login.

Visit the following **temporary** front-end page to finish the corresponding tasks, which should be substituted by the front-end requests in the future.

```
Login: http://localhost:5000/auth/1
Register: http://localhost:5000/auth/2
Modify Password: http://localhost:5000/auth/3
Logout: http://localhost:5000/auth/logout
```
For conveniently simulate the login infomation, open a new terminal, change the working directory to `api/auth/test/`. Use `node generate_user_logininfo.js` to generate the login info after modifying it.

Once logged in, visiting `http://localhost:5000` again will redirect the request to `http://localhost:8000/`, which is a **temporary** front-end UI for uploading the photos (which should be removed in the final product).

When a new user is registered, the auth server will send a request to the storage server, and the storage server will create a root storage directory for the user under `/public/data/` with the user ID, where user can store his/her images in the future.

## Use the Storage API

After logging in, user can visit `http://localhost:8000/` (or `http://localhost:5000` as it will redirect the request to `http://localhost:8000/` now), where we provide a **temporary** front-end page to upload the photo (which should be removed in the final product).

When user upload a valid image in `jpg/jpeg/png` format, the server save the image in a storage directory specific `/public/data/[user_id]/photos/` to the user, and will generate a thumbnail image of small size for display (also save in the user-specific directory `/public/data/[user_id]/thumbnails/`), and will save those paths along with some meta info of the image to the backend database.

To retrieve a list of all the uploaded images for the user, send a GET request to `http://localhost:8000/query`, and the response json will contain information of all the uploaded images, including the paths to the original images and their thumbnails, which can be accessed only with authorization.

(Currently, to have visualized view of all the uploaded images, we provide a **temporary** front-end display with `http://localhost:8000/query?view=true`, which will be removed in the final product.)

To retrieve a list of all the recycled images for the user, send a GET request to `http://localhost:8000/query` with query parameter `recycled=true` (e.g. `http://localhost:8000/query?recycled=true`) and the response json will be in the same format of the normal images, except that those images are currently in the "recycle bin".

(Similarly, to have visualized view of all the recycled images, we provide a **temporary** front-end display with `http://localhost:8000/query?view=true&recycled=true`)

To change the state of a image to normal/recycled/deleted, a POST request should be sent to `http://localhost:8000/set-state?[set_recycled/set_deleted]=[true/false]` (e.g. `http://localhost:8000/set-state?set_recycled=true` will move the image into the "recycle bin"), and the request body should contain a parameter with `imagename` as key and the operating image name as value.

## To Be Implemented
1. Private album (extra authentication procedures)

