const URL = `https://forum2022.codeschool.cloud`

// GET thread : 'posts' (threads)
// POST thread name | description | category : new thread
// GET thread/thread_id : 'comments' (posts) -->websocket?
// DELETE thread/thread_id : gone thread

// POST post thread_id | body : new comment --> ???
// DELETE thread/thread_id/post/post_id : gone comment --> ???

                    // Vue.component ('name', {
                    //     props: [],
                    //     template: ``,
                    //     data: function () {return {}},
                    //     methods: {},
                    // });
Vue.component ('this-thread', {
    props: {'thread': Object, 'gotothread': Function},
    template: ` <div>
                    <h1 @click="gotothread(thread)">Title: {{thread.name}}</h1>
                    <h2>Category: {{thread.category}}</h2>
                    <p>{{thread.description}}</p>
                </div>`,
})
Vue.component ('single-thread', {
    props: {'thread': Object, 'backtothreads': Function, 'deletethis': Function},
    template: ` <div>
                    <button @click="backtothreads">Back To Threads</button>
                    <div>
                        <h1>Title: {{thread.name}}</h1>
                        <p>{{thread.description}}</p>
                    </div>
                    <div v-for="post in thread.posts">
                        <h2>{{post.body}}</h2>
                        <p>{{post.user.username}}</p>
                        <button @click=deletethis(thread, post)>Remove</button>
                    </div>
                </div>`,
    data: function () {
        return {}
    }
})

var app = new Vue({
    el: "#app",
    data: {
        newUser: true,
        username: '',
        password: '',
        fullname: '',

        logCookie: false,
        showPost: false,
        logMessage: '',

        threadList: [],
        currentThread: {},
        postMessage: '',
    },
    methods: {
        newUserLogIn: function () {
            let userlog = {
                "fullname": this.fullname,
                "username": this.username,
                "password": this.password
            };
            this.postUser(userlog);
        },
        userLogIn: function () {
            let userlog = {
                "username": this.username,
                "password": this.password
            };
            this.postSession(userlog);
        },
        gotoThread: function (thisThread) {
            this.showPost = true;
            this.getThread(thisThread._id);
        },
        backtoThreads: function () {
            this.showPost = false;
            this.currentThread = {};
        },
        addPost: function (thisThread, message) {
            let id = thisThread._id
            let newPost = {
                'thread_id': id,
                'body': message
            }
            this.postPost(newPost, id);
            this.postMessage = '';
        },
        removePost: function (thisThread, thisPost) {
            let threadID = thisThread._id;
            let postID = thisPost._id;
            this.deletePost(threadID, postID);
        },
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.status == 200){
                this.logCookie = true;
                this.getThreads();
            }
            let data = await response.json();
            console.log(response.status);
            console.log(data);
        },
        postSession: async function (userinfo) {
            let response = await fetch(`${URL}/session`, {
                method: 'POST',
                body: JSON.stringify(userinfo),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let body = await response.json();
            console.log(response.status);
            console.log(body);
            if (response.status == 201){
                this.username = '';
                this.password = '';
                this.logMessage = '';
                this.getSession();
            }else{
                this.password = '';
                this.logMessage = `invalid: username or password incorrect`;
            }
        },
        postUser: async function (userinfo) {
            let response = await fetch(`${URL}/user`, {
                method: 'POST',
                body: JSON.stringify(userinfo),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = await response.json();
            console.log(response.status);
            if(response.status == 201){
                this.password = '';
                this.fullname = '';
                this.newUser = false;
                console.log(data);
            }
        },
        getThreads: async function () {
            let response = await fetch(`${URL}/thread`, {
                method: 'GET',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status);
            this.threadList = data;
        },
        getThread: async function (id) {
            let response = await fetch(`${URL}/thread/${id}`, {
                method: 'GET',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status);
            this.currentThread = data;
        },
        postPost: async function (post, id) {
            let response = await fetch(`${URL}/post`, {
                method: 'POST',
                body: JSON.stringify(post),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if(response.status == 200){
                this.getThread(id);
            }
        },
        deletePost: async function (thread_id, post_id) {
            let response = await fetch(`${URL}/thread/${thread_id}/post/${post_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status)
            console.log(data);
            this.getThread(thread_id);
        },
    },
    created: function () {
        this.getSession();
    },
});