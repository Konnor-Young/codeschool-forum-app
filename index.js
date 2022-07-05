const app = require(`./server/server.js`);
const { connect, onConnect } = require(`./persist/connect.js`);
const config = require(`./config/config.js`);

config.dotenv.config();

onConnect(()=>{
    app.server.listen(config.http_port, () => {
        console.log(`listening on port ${config.http_port}`);
    });
});


try{
    // connect(
    //     config.mongo_user, 
    //     config.mongo_pass, 
    //     config.mongo_host, 
    //     config.mongo_port, 
    //     config.mongo_db
    // );
    connect(
        process.env.USERNAME,
        process.env.PASSWORD
    );
}
catch (err){
    console.log(`could not connect`, err);
}