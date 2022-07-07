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
        return;
    }
});
app.get("/threads", async (req, res) => {
    let thread_list;

    try {
        thread_list = await Thread.find({}, '-posts');
    } catch (err) {
        res.status(500).json({message:`threads not found`, error: err});
        return;
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
        return;
    }

    try {
        thisThread = thisThread.toObject();
        let user = await User.findById(thisThread.user_id, '-password');
        thisThread.user = user.toObject();
    } catch (err) {
        console.log(`unable to get user when getting thread ${err}`);
    }

    for(let i in thisThread.posts){
        try {
        let user = await User.findById(thisThread.posts[i].user_id, '-password');
        thisThread.posts[i].user = user.toObject();
        } catch (err) {
            console.log(`unable to find user for this post ${err}`);
        }
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
        return;
    }
});
app.post("/posts", async (req, res) => {
    if(!req.user){
        res.status(401).json({message: "unauthenticated"});
        return;
    }
    let thread;
    try {
        thread = await Thread.findByIdAndUpdate(
            req.body.thread_id,
            {
                $push: {
                    posts: {
                        user_id: req.user.id,
                        body: req.body.body,
                        thread_id: req.body.thread_id,
                    },
                },
            },
            {new: true,}
        );
    if(!thread) {
        res.status(404).json({message: 'thread not found', id: req.body.thread_id});
        return;
    }
    } catch (err) {
        res.status(500).json({message: "post not created", error: err});
        return;
    }
    res.status(201).json(thread.posts[-1]);
});
app.delete("/threads/:id", async (req, res) => {
    if(!req.user){
        res.status(401).json({message: "unauthenticated"});
        return;
    }
    console.log(`request to delete thread id:${req.params.id}`);
    let thread;
    try {
        thread = await Thread.findById(req.params.id);
    } catch (err) {
        res.status(500).json({message: `failed to delete`});
        return;
    }
    if(thread ===  null) {
        res.status(404).json({message: `couldn't find no delete`});
        return;
    }
    if(thread.user_id != req.user.id) {
        res.status(403).json({message: `not allowed`});
        return;
    }
    try {
        await Thread.findByIdAndDelete(req.params.id);
    } catch (err) {
        res.status(500).json({message: `not deleted`});
        return;
    }
});
app.delete("/threads/:thread_id/posts/:post_id", async (req, res) => {
    if(!req.user){
        res.status(401).json({message: "unauthenticated"});
        return;
    }

    let thread;
    let thisUser = false;
    let post;

    try {
        thread = await Thread.findOne({
          _id: req.params.thread_id,
          "posts._id": req.params.post_id,
        });
      } catch (err) {
        res.status(500).json({
          message: `error finding thread when deleting post`,
          error: err,
        });
        return;
      }

    if(!thread){
        res.status(404).json({message: `could not find post`});
        return;
    }

    for(let i in thread.posts){
        if(thread.posts[i]._id == req.params.post_id){
            post = thread.posts[i];
            if(thread.posts[i].user_id == req.user.id){
                thisUser = true;
            }
        }
    }
    if(!thisUser){
        res.status(403).json({message: `not allowed`});
        return;
    }

    try {
    await Thread.findByIdAndUpdate(req.params.thread_id, {
        $pull: {
            posts: {
                _id: req.params.post_id,
            },
        },
    });
    } catch (err) {
        res.status(500).json({message: `error deleting post`});
        return;
    }
    res.status(200).json(post)
});

// if(!req.user){
//     res.status(401).json({message: "unauthenticated"});
//     return;
// }

module.exports = {
    server: server,
};