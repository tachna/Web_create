//서버
//express library 사용
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) //post요청을 위해
const MongoClient = require('mongodb').MongoClient;//mongodb 사용
app.set('view engine', 'ejs'); //ejs 사용 헤더
app.use('/public', express.static('public')) //미들웨어, public폴더를 사용할것이다 (css파일관련)
app.use('/uploads', express.static('uploads'));
require('dotenv').config()//env환경변수 선언


var db;
MongoClient.connect(process.env.DB_URL,function(err, client){
    if(err) return console.log(err)
    db = client.db('p-db');
    app.listen(process.env  .PORT,function(){
        console.log('listening on 3000')
    });
})

app.get('/', function(req, res){
    res.render('homepage.ejs');
});
app.get('/install', function(req, res){
    res.render('install.ejs');
});
app.get('/list', function(req, res){
    db.collection('post').find().toArray(function(err,result){
        console.log(result);
        res.render('list.ejs', { posts : result});
    });
});
app.get('/login', function(req, res){
    res.render('login.ejs');
});
app.get('/write', function(req, res){
    res.render('write.ejs');
});

//어떤 사람이 /add 경로로 post요청을 하면 ~를 해주세요
app.post('/add', function(req,res){//정보는 요청 부분에 저장되어있음
    res.render('homepage.ejs');//post기능을 사용하기 위해선 app.use(express.urlencoded({extended: true})) 삽입필요
    db.collection('counter').findOne({name:'게시물갯수'}, function(err,result){
        console.log(result.totalPost) // () -> 총게시물갯수
        var 총게시물갯수 = result.totalPost;
        db.collection('post').insertOne({_id : 총게시물갯수 +1, 제목 : req.body.title, 내용 : req.body.descript},function(err,result){
            console.log('saved');
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1}}, function(err,result){
                if(err){return console.log(err)}
                
            })
        })
    })
})


//삭제 기능구현
app.delete('/delete',function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body,function(err, result){
        console.log('delete succeed');
        res.status(200).send({message:'succeed'});
    })
})
