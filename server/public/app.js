const URL = `http://localhost:8080`

                    // Vue.component ('name', {
                    //     props: [],
                    //     template: ``,
                    //     data: function () {return {}},
                    //     methods: {},
                    // });

Vue.component ('this-thread', {
    props: {'thread': Object, 'gotothread': Function, 'removethis': Function},
    template: ` <div class="thread-container">
                    <div>
                        <h1 @click="gotothread(thread)">Title: {{thread.name}}</h1>
                        <p>{{thread.description}}</p>
                    </div>
                    <button @click="removethis(thread)">Delete</button>
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
                        <button @click="deletethis(thread, post)">Remove</button>
                    </div>
                </div>`,
    data: function () {
        return {}
    }
})
Vue.component ('this-thread-input', {
    props: {addthread: Function},
    template: `<div>
                    <h1>What would you like to say?</h1>
                    Title: <input type="text" v-model="newtitle">
                    Category: <input type="text" v-model="newcategory">
                    Description: <input type="text" v-model="newdescription">
                    <button @click="addthread(newtitle, newcategory, newdescription)">Submit</button>
                </div>`,
    data: function (){
        return{
            newtitle: '',
            newcategory: '',
            newdescription: ''
        }},
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
        newPost: false,
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
        addThread: function (name, tag, body){
            let newestThread = {
                "name": name,
                "category": tag,
                "description": body
            };
            this.postThread(newestThread);
            this.newPost = false;
        },
        removePost: function (thisThread, thisPost) {
            let threadID = thisThread._id;
            let postID = thisPost._id;
            this.deletePost(threadID, postID);
        },
        removeThread: function (thisThread) {
            let id = thisThread._id;
            this.deleteThread(id);
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
            let data = await response;
            console.log(response.status);
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
            // let body = await response.json();
            console.log(response.status);
            // console.log(body);
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
            let response = await fetch(`${URL}/users`, {
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
            let response = await fetch(`${URL}/threads`, {
                method: 'GET',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status);
            this.threadList = data;
        },
        getThread: async function (id) {
            let response = await fetch(`${URL}/threads/${id}`, {
                method: 'GET',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status);
            this.currentThread = data;
        },
        postPost: async function (post, id) {
            let response = await fetch(`${URL}/posts`, {
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
        postThread: async function (thread) {
            let response = await fetch(`${URL}/threads`, {
                method: 'POST',
                body: JSON.stringify(thread),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            if(response.status == 200){
                this.getThreads();
            }
        },
        deletePost: async function (thread_id, post_id) {
            let response = await fetch(`${URL}/threads/${thread_id}/posts/${post_id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status)
            console.log(data);
            this.getThread(thread_id);
        },
        deleteThread: async function (id) {
            let response = await fetch(`${URL}/threads/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            let data = await response.json();
            console.log(response.status);
            console.log(data);
            this.getThreads();
        }
    },
    created: function () {
        this.getSession();
    },
});