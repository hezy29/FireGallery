const fs = require('fs');

const DATA_ROOT = './public/data/';

function createStorageDirectory(userid) {
  const user_dir = DATA_ROOT + userid;
  
  if (fs.existsSync(user_dir)) {
    throw new Error(`User directory for ${userid} already exists when trying to create!`);
  }
  
  fs.mkdirSync(user_dir, { recursive: true });
}


module.exports = { createStorageDirectory };