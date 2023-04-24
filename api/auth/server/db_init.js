const { MongoClient } = require('mongodb');

const mongoURL = 'mongodb://localhost/album';

let db;

function getDb() {
  return db;
}

async function connectToDb() {
    client = new MongoClient(mongoURL, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB at', mongoURL);
    db = client.db();
}

module.exports = { getDb, connectToDb };