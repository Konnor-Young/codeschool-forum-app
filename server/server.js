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
app.get("/threads", async (req, res) => {
    let thread_list;
    try {
        thread_list = await Thread.find({}, '-posts');
    } catch (err) {
        res.status(500).json({message:`threads not found`, error: err});
    }

    for(let i in thread_list){
        try {
        thread_list[i] = thread_list[i].toObject();
        let user = await User.findById(thread_list[i].user_id, '-password');
        thread_list[i].user = user.toObject();
        } catch (err) {
            console.log(`unable to get user when getting thread ${err}`);
        }
    }
    res.status(200).json(thread_list);
});
app.get("/threads/:id", async (req, res) => {
    let id = req.params.id
    let thisThread;
    try {
        thisThread = await Thread.findById(id);
    } catch (err) {
        res.status(500).json({message:`thread not found`, error: err});
    }
    try {
        thisThread = thisThread.toObject();
        let user = await User.findById(thisThread.user_id, '-password');
        thisThread.user = user.toObject();
    } catch (err) {
        console.log(`unable to get user when getting thread ${err}`);
    }
    res.status(200).json(thisThread);
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

// if(!req.user){
//     res.status(401).json({message: "unauthenticated"});
//     return;
// }

module.exports = {
    server: server,
};