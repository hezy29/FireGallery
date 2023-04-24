const md5 = require('md5');
const { getDb } = require('./db_init.js')
const { AuthenticationError, UserInputError } = require('./error.js');

const LOGIN_EXPIRE_TIME = 120;

async function findEmail(email) {
  const re = RegExp("[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+)+");
  
  if (email.match(re) == null) {
    throw new UserInputError('Invalid email entered');
  }

  const db = getDb();
  console.log(`Checking the existence of ${email} in the database`);
  const userFound = await db.collection('users').findOne({email : email});
  return userFound;
}

async function checkEmail(email) {
  const userFound = await findEmail(email);
  return userFound != null;
}

async function verify(logininfo) {
  console.log('Verify login info:', logininfo);
  
  const loginEmail = logininfo.email;
  const loginTime = new Date(logininfo.loginTime);
  const currTime = new Date();
  const timeDiff = (currTime - loginTime) / 1000 // difference in seconds
  if (timeDiff > LOGIN_EXPIRE_TIME) {
    throw new AuthenticationError('Expired authentication request');
  }

  let verifyResult = { success: false,  id: null };
  const userFound = await findEmail(loginEmail);
  if (userFound === null) return verifyResult;

  const digestObject = {email: loginEmail, password: userFound.password, time: loginTime};
  const serverDigest = md5(JSON.stringify(digestObject));

  const clientDigest = logininfo.digest;

  if (clientDigest != serverDigest) return verifyResult;

  verifyResult.success = true;
  verifyResult.id = userFound._id;
  return verifyResult;
}

async function addUser(userinfo) {
  console.log('Create user record for', userinfo.email);

  const db = getDb();
  userinfo.created = new Date();
  const insertResult = await db.collection('users').insertOne(userinfo);
  return insertResult;
}

async function modifyPassword(userinfo) {
  console.log('Modify password of', userinfo.email);

  const userEmail = userinfo.email;
  const opTime = userinfo.time;
  const clientDigest = userinfo.digest;
  const verifyinfo = { email: userEmail, loginTime: opTime, digest: clientDigest };

  const verifyResult = await verify(verifyinfo);
  if (!verifyResult.success) {
    throw new AuthenticationError("Authentication Failure");
  }
  
  const db = getDb();
  const newPassword = userinfo.newPassword;
  const updateResult = await db.collection('users').updateOne({ email: userEmail }, { $set: { password: newPassword}});
  return updateResult.acknowledged;
}

async function deleteUser(userid) {
  const db = getDb();
  const deleteResult = await db.collection('users').deleteOne({ _id: userid });
  return deleteResult.acknowledged;
}

module.exports = { checkEmail, verify, addUser, modifyPassword, deleteUser };
