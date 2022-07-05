const express = require('express');
const app = express();
const cors = require(`cors`);
const http = require(`http`);
const server = http.createServer(app);
const { Server } = require(`socket.io`);
const io = new Server(server);
const { User } = require(`../persist/model`);
const setUpAuth = require(`./auth`);
const setUpSession = require(`./session`);

app.use(express.static(`${__dirname}/public/`));
app.use(express.json());

setUpSession(app);
setUpAuth(app);

app.post("/users", async (req, res) => {
    try {
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            password: req.body.password,
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: `failed to create user`,
            error: err,
        });
    }
});

module.exports = {
    server: server,
};