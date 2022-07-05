const express = require('express');
const app = express();
const cors = require(`cors`);
const http = require(`http`);
const server = http.createServer(app);
const { Server } = require(`socket.io`);
const io = new Server(server);
const { User, Thread } = require(`../persist/model`);
const setUpAuth = require(`./auth`);
const setUpSession = require(`./session`);

app.use(express.static(`${__dirname}/public/`));
app.use(cors());
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
app.get("/threads", (req, res) => {

});
app.get("/threads/:id", (req, res) => {

});
app.post("/threads", async (req, res) => {
    if(!req.user){
        res.status(401).json({ message: "unauthenticated" });
        return;
    }
    try {
        let thread = await Thread.create({
            user_id: req.user.id,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
        });
        res.status(201).json(thread);
    } catch (err) {
        res.status(500).json({ message: `thread not created`, error: err });
    }
});
app.post("/posts", (req, res) => {

});
app.delete("/threads/:id", (req, res) => {

});
app.delete("/threads/:id/posts/:id", (req, res) => {

});

module.exports = {
    server: server,
};