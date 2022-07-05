const dotenv = require('dotenv');
const flags = require('flags');
flags.defineNumber("port", 3000);
flags.parse();

const port = flags.get("port") || process.env.PORT || 3000;

module.exports = {
    mongo_user: "new_user",
    mongo_pass: "password",
    mongo_port: '27018',
    mongo_host: "127.0.0.1",
    mongo_db: "cs-forum-2022",
    http_port: port,
    dotenv: dotenv
};