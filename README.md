# Simple Cloud Photo Album

*Authors: HE Ziyang, HUANG Haijian*

## Proposed Features

### Backend

1. User registration and authentication using email and password
2. Create a certain amount of storage space of each registered user (using virtualization or container techniques)
3. Handle multiple I/O requests from frontend at the same time (using a multi-thread server such as Apache or Nginx)
4. Create a virtual file system (essentially a directory structure) for each user to store their uploaded photos, which includes customized albums created by the user for classifying their photos
5. Generate the corresponding thumbnail pictures asynchronously, which would be retrived when a user visits his/her album in the website

### Frontend

1. Upload photos to a particular album owned by the user
2. Display photo thumbnails following the timeline of when the photos were taken
3. Retrieve and display the original high-resolution photo when the user clicks the corresponding thumbnail picture
4. Perform basic modifications (adjustment of brightness, scaling, cropping, etc.) and synchronize the result to the backend

## Advanced Features (that can be implemented)

1. Allow third-party authentication service, so that users can use their Google, Apple, or WeChat account to log in
2. Allow each user to create one secret album, where a predefined password would be checked for each access
3. Allow multiple users to co-manage the same album (shared album)
4. Support of mobile access and sharing photos through social media by calling the corresponding third-party APIs
5. Distribute the cloud storage of photos into multiple server machines to utilize more storage space and alleviate the pressure caused by concurrent visits
6. Attach each photo to a map according to the location where it is taken and display the map as a "footprint" of the user, which can be shared through social media
7. Attach a blockchain token to each photo to register the copyright and prevent unauthorized modifications