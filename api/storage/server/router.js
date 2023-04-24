const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const express = require('express');
const multer = require('multer');
const FileType = require('file-type');
const { createStorageDirectory } = require('./manipulate.js');
const { extractImageMeta, createThumbnail } = require('./image.js');
const { addImage, queryImages, setState, unsetState } = require('./db.js');

const DATA_ROOT = './public/data/';
const DUMMY_DEST = DATA_ROOT + 'undefined/';

const router = express.Router();
var upload = multer({ dest: DUMMY_DEST });

function isAuthenticated (req, res, next) {
  req.session.reload(() => console.log("Session data refreshed"));
  if (!req.session.userID) {
    console.log(`Request of ${req.url} from unknown user detected`);
    res.status(401).json({ status: 0, info: 'Unauthorized access' });
  }
  else next();
}

function setStorageDest(req, res, next) {
  const userID = req.session.userID;
  const userdest = DATA_ROOT + userID + '/photos/'
  fs.mkdirSync(userdest, { recursive : true });
  upload.storage.getDestination = function ($0, $1, cb) { cb(null, userdest) };
  next();
}

router.get('/about', (req, res) => {
  res.send('About the storage server');
});

/* TODO: modify the front-end code*/
/* Temporary front-end code, which should be removed in the future */
/* Front-end code should directly send post request to `/upload` in the future */
router.get('/', isAuthenticated, (req, res) => {
  console.log(`Receive request from user ${req.session.userID}`);

  const userID = req.session.userID;
  res.status(200);
  res.write(`<h1>This is the storage server! Wellcome, ${userID}!</h1>`)
  res.write('<form action="/upload" method="post" enctype="multipart/form-data">' +
             'File: <input type="file" name="photo" />' +
             '<input type="submit" text="Upload" />' + 
             '</form>')
  res.end();
});
/* Front-end code ends here */

router.post('/create', isAuthenticated, (req, res) => {
  const userID = req.session.userID;
  console.log(`Create storage directory for user ${userID}`);

  try {
    createStorageDirectory(userID);
    res.status(200).json( { status: 1, info: 'Success' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json( { status: 0, info: error.message } );
  }
});

router.post('/upload', isAuthenticated, setStorageDest, upload.single('photo'), async (req, res) => {
  // TODO: verify valid image format at the front-end

  const userID = req.session.userID;
  const fname = req.file.filename;
  const fpath = req.file.destination + fname;
  
  console.log(`Rename uploaded image ${fname} with extension`);
  const pbuffer = fs.readFileSync(fpath);
  const formatinfo = await FileType.fromBuffer(pbuffer);
  const fpathWithExt = fpath + '.' + formatinfo.ext;
  fs.renameSync(fpath, fpathWithExt);

  const imageMeta = await extractImageMeta(fpathWithExt);
  // console.log(imageMeta);

  // TODO: verify the file via md5 comparison
  // const serverDigest = md5(pbuffer);
  
  const thumbnailPath = DATA_ROOT + userID + '/thumbnails/' + fname + '.jpg';
  createThumbnail(pbuffer, thumbnailPath)
    .catch(error => {
      console.log(error.message);
      res.status(500).json({ status: 0, info: 'Internal Server Error'});
    })

  const fnameFull = fname + '.' + formatinfo.ext;
  const thumbnailNameFull = fname + '.jpg';
  const insertResult = await addImage(userID, fnameFull, thumbnailNameFull, imageMeta);
  if (insertResult) {
    res.status(200).json({ status: 1, info: 'Success' });
  } else {
    console.log(`Unable to insert the image record for user ${userID}`);
    res.status(500).json({ status: 0, info: 'Internal Server Error'});
  }
});

router.get(/\/public\/data\/(\w+)\/(photos|thumbnails)\/\w+\.(jpe?g|png)/, isAuthenticated, (req, res) => {
  
  const re = /\/public\/data\/(\w+)\/(photos|thumbnails)\/\w+\.(jpe?g|png)/
  const matches = req.url.match(re);
  const resource = matches[0];
  const requestID = matches[1];
  const userID = req.session.userID;

  // Block unauthorized access
  if (!userID || userID != requestID) {
    console.log(`Unauthorized Access from ${userID} for resource ${resource}`);
    res.status(403).json({ status: 0, info: 'Unauthorized access'});
  } else {
    console.log(`User ${userID} requests for resource ${resource}`);
    res.status(200).sendFile(resource, { root: path.resolve(__dirname, '..') }); // currently inside the `server` folder
  }
});

router.get('/query', isAuthenticated, async (req, res) => {
  const userID = req.session.userID;
  
  // For querying photos in the recycle bin, front-end should send request like `http://localhost:8000/query?recycled=true`
  const getRecycled = req.query && req.query.recycled === 'true';
  const filter = { recycled: (getRecycled ? 'true' : null) };

  const imageList = await queryImages(userID, filter);
  
  if (!req.query || req.query.view != 'true') {
    res.status(200).json({status: 1, info: 'Success', imageList: imageList});
  } else {
    /* TODO: modify the front-end code*/
    /* 
    Temporary front-end code for a visualization of the normal image list at 
    `http://localhost:8000/query?view=true`, and the recycled image list at 
    `http://localhost:8000/query?view=true&recycled=true`, which should be removed 
    in the future 
    */
    const response = {status: 1, info: 'Success', imageList: imageList};
    const recycleButtonURL = 'set-state?set_recycled=' + (getRecycled ? "false" : "true");

    res.status(200);
    res.write("<p>Prospective response in the future:</p>");
    res.write(`<p>${JSON.stringify(response)}</p>`);
    
    res.write("<p>Illustrative response:</p>");
    res.write("<br/>")
    res.write("<table border='1'>");
    res.write("<tr>" + 
              "<th>Image Name</th>" +
              "<th>Width</th>" +
              "<th>Height</th>" + 
              "<th>Taken Date</th>" + 
              "<th>Latitude</th>" + 
              "<th>Longitude</th>" + 
              "<th>Image Path</th>" + 
              "<th>Thumbnail Path</th>" + 
              `<th>${getRecycled ? "Undo Recycle" : "Recycle" }</th>` + 
              "</tr>");
    
    imageList.forEach(image => 
      res.write('<tr>' + 
                `<td>${image.name}</td>` + 
                `<td>${image.width}</td>` + 
                `<td>${image.height}</td>` + 
                `<td>${image.takenDate.toDateString()}</td>` +
                `<td>${image.latitude}</td>` + 
                `<td>${image.longitude}</td>` + 
                `<td><a href="${image.path}">${image.path}</td>` + 
                `<td><a href="${image.thumbnailPath}">${image.thumbnailPath}</td>` +
                `<td><form action=${recycleButtonURL} method="post">` + 
                `<button name="imagename" value=${image.name}>${getRecycled ? "Undo" : "Recycle" }</button>` +
                '</form></td>' + 
                '</tr>')
    )
    
    res.write("</table>");
    res.end();
    /* Front-end code ends here */
  }
});

router.post('/set-state', isAuthenticated, express.urlencoded({ extended: false }), async (req, res) => {
  /*
  API document: POST request should:
  1. carry a authorization cookie header (which is automatically maintained) for
     identifying the user
  2. carry the image name with key `imagename` for recycling in the requst body
  3. carry one and only one query parameter `[set_recycled/set_deleted/set_private]=[true/false]` 
     for specifying how to deal with the image
  */

  const userID = req.session.userID;
  const imageName = req.body.imagename;

  if (!imageName) {
    res.status(400).json({ status:0, info: "No image name specified" });
    return ;
  }

  // Only one state can be set in one request
  let stateCount = 0;
  stateCount += req.query.set_recycled != undefined;
  stateCount += req.query.set_deleted != undefined;
  stateCount += req.set_private != undefined;

  if (!req.query || stateCount != 1) {
    req.status(400).json( { status: 0, info: "No valid state specified"});
    return ;
  }

  let updateResult;
  if (req.query.set_recycled) {
    if (req.query.set_recycled === 'true') {
      updateResult = setState(userID, imageName, 'isRecycled');
    } else if (req.query.set_recycled === 'false') {
      updateResult = unsetState(userID, imageName, 'isRecycled');
    }}
  
  if (req.query.set_private) {
    if (req.query.set_private === 'true') {
      updateResult = setState(userID, imageName, 'isPrivate');
    } else if (req.query.set_private === 'false') {
      updateResult = unsetState(userID, imageName, 'isPrivate');
    }}
  
  // Cannot undo deletion
  if (req.query.set_deleted && req.query.set_deleted === 'true') {
    updateResult = setState(userID, imageName, 'isDeleted');
  }

  if (updateResult) {
    res.status(200).json({ status: 1, info: 'Success' });
  } else {
    console.log(`Unable to set state for ${userID} - ${imageName}`);
    res.status(500).json({ status: 0, info: 'Internal Server Error'});
  }
});


module.exports = router;