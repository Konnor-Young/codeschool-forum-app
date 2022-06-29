const URL = `https://forum2022.codeschool.cloud`

var app = new Vue({
    el: "#app",
    data: {
        newUser: true,
        username: '',
        password: '',
        fullname: '',

        logCookie: false,
        logMessage: '',
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
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.status == 200){
                this.logCookie = true;
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
                this.logCookie = true;
                this.logMessage = '';
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
    },
    created: function () {
        this.getSession();
    },
});