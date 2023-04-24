/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */

db.users.remove({});
db.images.remove({});
db.sessions.remove({});

const initialUsers = [
    {email: "abc123@hotmail.com", name: "Albert", password: "12345678", created: new Date("2023-01-01")},
    {email: "example_user@u.nus.edu", name: "Carol", password: "66666666", created: new Date("2023-04-01")}
]

db.users.insertMany(initialUsers);
const count = db.users.count();
print(`Inserted ${count} initial users`);

db.users.createIndex({ email: 1 }, { unique: true });
db.images.createIndex({ userid: 1 }, { unique: true } );
db.images.createIndex({ userid: 1, name: 1 }, { unique: true });
db.images.createIndex({ userid: 1, takenDate: -1 });