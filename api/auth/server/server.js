const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { connectToDb } = require('./db_init.js');
const { checkEmail, verify, addUser, modifyPassword, deleteUser } = require('./account.js')
const { AuthenticationError, UserInputError } = require('./error.js');
const { getSessionCookie } = require('./session.js');

const SESSION_DURATION = 1000 * 60 * 30;
const SESSION_SERVER_TOKEN = 'simple_cloud_album_secret';

async function fetchFromStorage(url, method, headers=null, body=null) {
  const response = await fetch(url, { method : method, headers: headers, body: body });
  const responseBody = await response.text();
  const result = JSON.parse(responseBody);
  return result;
}


const app = express();
app.use(session({ secret: SESSION_SERVER_TOKEN,
                  name: 'Session_ID',
                  resave: false,
                  saveUninitialized: false,
                  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/album', touchAfter: 1800 }),
                  cookie: {maxAge: SESSION_DURATION},
                }));

/* TODO: modify the front-end code*/
/* Temporary front-end code, which should be modified in the future */

app.get('/', async (req, res) => {
  // console.log(req.session);
  if (!req.session.userID) {
    res.redirect('/auth/1')
  } else {
    // console.log(req.session.id);
    // console.log(req.session.userID);
    
    let sessionCookie = getSessionCookie(req);
    let sessionHeader = { 'Cookie': sessionCookie };
    res.redirect('http://localhost:8000/');
  }
});

app.get('/auth/1', (req, res) => {
  res.send('<form action="http://localhost:5000/auth/login" method="post">' +
    'Email: <input name="email"><br>' +
    'LoginTime: <input name="loginTime"><br>' +
    'Digest: <input name="digest"><br>' + 
    '<input type="submit" text="Login"></form>')
});

app.get('/auth/2', (req, res) => {
  res.send('<form action="http://localhost:5000/auth/register" method="post">' +
    'Email: <input name="email"><br>' +
    'Password: <input name="password" type="password"><br>' +
    'Confirm password: <input name="password2" type="password"><br>' +
    '<input type="submit" text="Register"></form>');
});

app.get('/auth/3', (req, res) => {
  res.send('<form action="http://localhost:5000/auth/modify" method="post">' +
    'Email: <input name="email"><br>' +
    'Time: <input name="time"><br>' +
    'Digest: <input name="digest"><br>' + 
    'NewPassword: <input name="newPassword" type="password"><br>' + 
    '<input type="submit" text="Modify"></form>');
});
/* Front-end code ends here */


app.post('/auth/login', express.urlencoded({ extended: false }), async (req, res) => {
  const logininfo = { email: req.body.email, loginTime: req.body.loginTime, digest: req.body.digest };
  try {
    const result = await verify(logininfo);
    if (result.success) {
      req.session.userID = result.id;
      res.status(200).json({ status: 1, info: "Success" });
    } 
    else {
      throw new AuthenticationError(`Login failure`);
    }
  } catch (error) {
      const code = error instanceof AuthenticationError ? 403 : 400;
      console.log(`${error.message} of ${req.body.email}`);
      res.status(code).json({ status: 0, info: error.message });
  }
});


app.post('/auth/register', express.urlencoded({ extended: false }), async (req, res) => {
  const useremail = req.body.email;
  const userpassword = req.body.password;
  
  try {
    const existed = await checkEmail(useremail);
    if (existed) {
      throw new UserInputError("Repeated registration")
    }
  } catch (error) {
    console.log(`${error.message} of ${useremail}`);
    res.status(400).json({ status: 0, info: error.message });
    return ;
  }
  
  const insertResult = await addUser({email: useremail, password: userpassword});
  const insertedID = insertResult.insertedId;
  if (insertResult.acknowledged) {
    console.log(`Allocated ID ${insertedID} to ${useremail}`);
    req.session.userID = insertedID;
    // Explicitly force the session to be saved in the database to avoid asynchronous problems
    req.session.save();
  } else {
    console.log(`Unable to insert the new user record for ${useremail}`);
    res.status(500).json({ status: 0, info: "Internal server error" });
    return ;
  }

  // Create storage directory for the user in the storage server
  let sessionCookie = getSessionCookie(req);
  let sessionHeader = { 'Cookie': sessionCookie };
  const result = await fetchFromStorage('http://localhost:8000/create', 'POST', sessionHeader);
  if (Number(result.status) == 1) {
    res.status(200).json( { status: 1, info: "Success" } );
  } else {
    // Clean up the current session
    req.session.userID = null;
    req.session.save(err => {
      if (err) next(err);

      req.session.regenerate(async err => {
        if (err) next(err);
        
        // Clean up the inserted record in case of storage error
        console.log(`Delete user record of ${useremail} in case of storage error`);
        const deleteResult = await deleteUser(insertedID);
        if (!deleteResult) {
          console.log(`Unable to delete the user record of ${useremail} in case of storage error`);
        }
        res.status(500).json({ status: 0, info: "Internal server error" });
      });
    });
  }
});


app.post('/auth/modify', express.urlencoded({ extended: false }), async (req, res) => {
  const userinfo = { email: req.body.email, time: req.body.time, 
                     digest: req.body.digest, newPassword: req.body.newPassword
                    };
  
  let result;
  try {
    result = await modifyPassword(userinfo);
  } catch (error) {
    const code = error instanceof AuthenticationError ? 403 : 400;
    console.log(`${error.message} of ${req.body.email}`);
    res.status(code).json({ status: 0, info: error.message });
    return ;
  }

  if (result) {
    // Reset the current session
    req.session.userID = null;
    req.session.regenerate(err => {
      if (err) next(err);
      res.status(200).json({ status: 1, info: "Success" });
    })

  } else {
    console.log(`Unable to update the password for ${useremail}`);
    res.status(500).json({ status: 0, info: "Internal server error"});
  }

});


app.get('/auth/logout', (req, res) => {
  req.session.userID = null;

  req.session.save(err => {
    if (err) next(err);
    req.session.regenerate(err => {
      if (err) next(err);
      res.status(200).json({status: 1, info: 'Success' });
    })
  });
});


(async function () {
  try {
    await connectToDb();
    app.listen(5000, () => console.log('Authorization app started on port 5000'));
  } 
  catch (err) {
    console.log('ERROR:', err);
  }
})();