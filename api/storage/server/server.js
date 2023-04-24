const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const router = require('./router.js');
const { connectToDb } = require('./db.js');

const SESSION_DURATION = 1000 * 60 * 30;
const SESSION_SERVER_TOKEN = 'simple_cloud_album_secret';

const app = express();
app.use(session({ secret: SESSION_SERVER_TOKEN,
                  name: 'Session_ID',
                  resave: false,
                  saveUninitialized: false,
                  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/album', touchAfter: 1800 }),
                  cookie: {maxAge: SESSION_DURATION}
                }));

app.use('/', router);

connectToDb()
  .then(() => app.listen(8000, () => console.log('Storage server started on port 8000')))
  .catch(err => console.log('ERROR:', err));