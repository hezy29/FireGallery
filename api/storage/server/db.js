const { MongoClient } = require('mongodb');

const mongoURL = 'mongodb://localhost/album';
const DATA_ROOT = 'http://localhost:8000/public/data/';
const VALID_IMAGE_STATES = new Set(['isRecycled', 'isDeleted', 'isPrivate']);

let db;

async function connectToDb() {
  client = new MongoClient(mongoURL, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', mongoURL);
  db = client.db();
}

async function addImage(userID, imageName, thumbnailName, imageMeta) {
  console.log(`Insert image record for user ${userID}`);

  const width = imageMeta.ImageWidth ? imageMeta.ImageWidth : null;
  const height = imageMeta.ImageHeight ? imageMeta.ImageHeight : null;
  const vendor = imageMeta.Make ? imageMeta.Make : null;
  const model = imageMeta.Model ? imageMeta.Model : null;
  const takenDate = imageMeta.CreateDate ? imageMeta.CreateDate : null;
  const latitude = imageMeta.latitude ? imageMeta.latitude : null;
  const longitude = imageMeta.longitude ? imageMeta.longitude : null;
  const uploadedDate = new Date();
  
  const imagePath = DATA_ROOT + userID + '/photos/' + imageName;
  const thumbnailPath = DATA_ROOT + userID + '/thumbnails/' + thumbnailName;
  const imageNameWithoutExt = thumbnailName.replace('.jpg', '');

  const imageRecord = { userid: userID, name: imageNameWithoutExt, 
                        width: width, height: height, 
                        takenDate: takenDate, uploadedDate: uploadedDate,
                        latitude: latitude, longitude: longitude,
                        vendor: vendor, model: model,
                        path: imagePath, thumbnailPath: thumbnailPath,
                        isRecycled: false, isDeleted: false, isPrivate: false
                      };

  const result = await db.collection('images').insertOne(imageRecord);
  return result.acknowledged;
}

async function queryImages(userID, filter=null) {
    const findRecycled = filter && filter.recycled ? true : false;
    const findPrivate = filter && filter.private ? true : false;
    
    // Images cannot be both recycled and private
    if (findRecycled && findPrivate) {
        throw new Error(`Filter error in the query for records of ${userID}`);
    }
    
    console.log(`Retrieve the list of photos for ${userID}`);
    const cursor = await db.collection('images').find({ userid: userID,
                                                        isRecycled: findRecycled,
                                                        isDeleted: false,
                                                        isPrivate: findPrivate
                                                      },
                                                      { projection: {'_id': 0, 'isRecycled': 0,
                                                        'isDeleted': 0, 'isPrivate': 0 }
                                                      })
                                                .sort({ takenDate: -1 }) ;
    return cursor.toArray();
}

async function setState(userID, imageName, state) {
  if (!VALID_IMAGE_STATES.has(state)) {
    throw new Error('Invalid state specified');
  }

  let result;
  if (state === 'isRecycled') {
    result = await db.collection('images').updateOne({ userid: userID, name: imageName },
                                                      { $set: { isRecycled: true } });
  } else if (state === 'isDeleted') {
    result = await db.collection('images').updateOne({ userid: userID, name: imageName },
                                                      { $set: { isDeleted: true } });
  } else if (state === 'isPrivate') {
    result = await db.collection('images').updateOne({ userid: userID, name: imageName },
                                                      { $set: { isPrivate: true } });
  }
  return result.acknowledged;
}

async function unsetState(userID, imageName, state) {
  if (state != 'isRecycled' && state != 'isPrivate') {
    throw new Error('Invalid state specified');
  }

  let result;
  if (state === 'isRecycled') {
    result = await db.collection('images').updateOne({ userid: userID, name: imageName },
                                                      { $set: { isRecycled: false } });
  } else if (state === 'isPrivate') {
    result = await db.collection('images').updateOne({ userid: userID, name: imageName },
                                                      { $set: { isPrivate: false } });
  }

  return result.acknowledged;
}


module.exports = { connectToDb, addImage, queryImages, setState, unsetState };