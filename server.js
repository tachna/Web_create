//서버
//express library 사용
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}))
const MongoClient = require('mongodb').MongoClient;//mongodb 사용
app.set('view engine', 'ejs');
app.use('/public', express.static('public')) //미들웨어, public폴더를 사용할것이다 (css파일관련)
app.use('/uploads', express.static('uploads'));


var db;
MongoClient.connect('mongodb+srv://cho1:jk007456@cluster0.ikeip.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',function(err, client){
    if(err) return console.log(err)
    db = client.db('p-db');
    app.listen(3000,function(){
        console.log('listening on 3000')
    });
})

app.get('/', function(req, res){
    res.sendFile(__dirname + '/homepage.html')
});
app.get('/list', function(req, res){
    res.sendFile(__dirname + '/list.html')
});
app.get('/install', function(req, res){
    res.sendFile(__dirname + '/install.html')
});
app.get('/login', function(req, res){
    res.sendFile(__dirname + '/login.html')
});


