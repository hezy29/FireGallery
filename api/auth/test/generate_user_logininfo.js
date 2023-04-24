const md5 = require('md5');

const email = 'abc123@hotmail.com';
const password = "12345678";
var time = new Date();
// time.setTime(time.getTime() - 1000 * 60 * 5);

const logininfo = {email: email, password: password, time: time};
const clientDigest = md5(JSON.stringify(logininfo));

console.log({email: email, loginTime: time, digest: clientDigest});