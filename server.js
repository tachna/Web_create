//서버 mongoDB: jo8020173@outlook.kr // jongbeom1* //p-db cho1//jk007456 //hi
//express library 사용
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) //post요청을 위해
const MongoClient = require('mongodb').MongoClient;//mongodb 사용
const mysql = require('mysql2');
app.set('view engine', 'ejs'); //ejs 사용 헤더
app.use('/public', express.static('public')) //미들웨어, public폴더를 사용 (css파일관련)
app.use(express.static('views')); //사진 
app.use('/uploads', express.static('uploads'));
require('dotenv').config()//env환경변수 선언
const methodOverride = require('method-override')// 메소드 오버라이드1
app.use(methodOverride('_method'))//메소드 오버라이드2


var options = {
    host : 'localhost',
    user : 'root',
    password : '1234',
    database : 'mydatabase'
}
//
const connection = mysql.createConnection({
    host : 'localhost',
    user:'root',
    password:'1234',
    database:'mydatabase',
    port:'3306'
});

app.listen(3000,()=>{
    connection.connect();
    console.log('server is running port 3000!');
});

app.get('/',function(req, res){
    connection.query('select * from people',function(err, rows){
        console.log(rows)
        res.render('index.ejs',{'data':rows},function(err,html){
            if(err){
                console.log(err)
            }
            res.end(html)
        })
    })
})

app.get('/tables', function(req, res){
    res.render('tables.ejs');
});

app.get('/charts', function(req, res){
    res.render('charts.ejs');
});
app.get('/buttons', function(req, res){
    res.render('buttons.ejs');
});
app.get('/cards', function(req, res){
    res.render('cards.ejs');
});









app.use('/',require('./routes/index.js'));//이메일 라우트 사용

app.get('/makeid', function(req, res){
    res.render('makeid.ejs');
});
app.get('/editmypage', function(req, res){
    res.render('editmypage.ejs');
});



//로긴 페이지 셋팅 -----------------------------------------------------------------------------------------------
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(session({secret:'비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());
//
app.get('/login',function(req, res){
    res.render('login.ejs')
});

app.get('/list',function(req, res){
  
    connection.query('select * from board',function(err, rows){
        var queryString = "SELECT * FROM people"
        connection.query(queryString,(err,rows,fields)=>{
            res.json(rows)
        })
    })
  })
  
  app.get('/loginlistview',function(req, res){
    
    connection.query('select * from board',function(err, rows){
      console.log(rows)
      res.render('login-notice_list.ejs', {'data' : rows}, function(err ,html){
        if (err){
            console.log(err)
        }
        res.end(html) // 응답 종료
      })
    })
  })
  


//------------------------------------------------------------------------


//------------------------------------------------------------------------
//localstrategy인증방식
passport.use(new LocalStrategy({ 
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
 }, function(입력한아이디, 입력한비번, done) {
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function(에러, 결과) {
         if (에러) return done(에러) 
         if (!결과) return done(null, false, { message: '존재하지않는 아이디요' }) 
         if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

// 세션유지 main
// 세션을 저장시키는 코드(로그인 성공시 발동)
passport.serializeUser(function(user, done){
    done(null, user.id)
});

app.get('/logout', function(req,res){
    req.logout();
  res.clearCookie('connect.sid');
  res.redirect('/');
  });
  
//이 세션 데이터를 가진 사람을 db에서 찾아주세요 (마이페이지 접속시 발동)
passport.deserializeUser(function(아이디, done){
    db.collection('login').findOne({ id : 아이디}, function(에러, 결과){
        done(null, 결과)
    })
});

// register로 post요청하면 db에 로그인 정보 추가
// app.post('/register', function(req,res){
//     db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw, _id: req.body.id, born: req.body.born, sex: req.body.sex, address: req.body.address, number: req.body.number, email: req.body.email
//     }, function(err,result){
//         res.redirect('/login')
//     })
// })
//어떤 사람이 /register 경로로 post요청을 하면 ~를 해주세요
app.post('/register', function(req,res){//정보는 요청 부분에 저장되어있음
    res.render('homepage.ejs');//post기능을 사용하기 위해선 app.use(express.urlencoded({extended: true})) 삽입필요
    db.collection('counter2').findOne({name:'아이디갯수'}, function(err,result){
        console.log(result.totalPost) // () -> 총게시물갯수
        var 총게시물갯수 = result.totalPost;
        var saver = { id: req.body.id, pw: req.body.pw, _id: 총게시물갯수 +1, born: req.body.born, sex: req.body.sex, address: req.body.address, number: req.body.number, email: req.body.email, email_b: req.body.edomain}
        db.collection('login').insertOne(saver,function(err,result){
            console.log('saved');
            db.collection('counter2').updateOne({name:'아이디갯수'},{ $inc : {totalPost:1}}, function(err,result){
                if(err){return console.log(err)}
                
            })
        })
    })
})

//어떤 사람이 /add 경로로 post요청을 하면 ~를 해주세요
app.post('/add', function(req,res){//정보는 요청 부분에 저장되어있음
    res.render('newpage.ejs');//post기능을 사용하기 위해선 app.use(express.urlencoded({extended: true})) 삽입필요
    db.collection('counter').findOne({name:'게시물갯수'}, function(err,result){
        console.log(result.totalPost) // () -> 총게시물갯수
        var 총게시물갯수 = result.totalPost;
        var saver = {serial_number : req.user._id,_id : 총게시물갯수 +1, id: req.user.id, 제목 : req.body.title, 내용 : req.body.descript, 작성일 : today.toLocaleDateString('ko-kr'), 조회수 : rand(1, 999)}
        db.collection('post').insertOne(saver,function(err,result){
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
    if(req.user._id=="manager"){
        var deldata = {_id: req.body._id}
        db.collection('post').deleteOne(deldata,function(err, result){
        console.log('delete succeed');
        if(err) {console.log(err)}
        res.status(200).send({message:'succeed'});
        })
    }
    else{
        var deldata = { _id: req.body._id, serial_number:req.user._id}
        db.collection('post').deleteOne(deldata,function(err, result){
        console.log('delete succeed');
        if(err) {console.log(err)}
        res.status(200).send({message:'succeed'});
    })
    }
    
})

//---------------------------------------------------------------------------------------------------------------


// edit.ejs파일에 내가 접속한경로의 아이디를 찾은후 쏴준다 
app.get('/edit/:id',function(req, res){
    db.collection('post').findOne({_id:parseInt(req.params.id)},function(err, result){
        console.log(result)
        res.render('edit.ejs',{post:result})
    })
    
})//put 요청을 하면, 요청.bodyid를 db에서 찾은후 제목과 날짜를 업데이트해준다

app.put('/edit',function(요청,응답){
    db.collection('post').updateOne({_id : parseInt(요청.body.id), serial_number:요청.user._id},
    { $set : {제목: 요청.body.title ,내용: 요청.body.descript}},function(에러, 결과){
        console.log('수정완료')
        응답.redirect('/list')
    })
});
//---------------------------------------------------------------------------------------------------------------

// edit.ejs파일에 내가 접속한경로의 아이디를 찾은후 쏴준다 
app.get('/editmypage',function(req, res){
    db.collection('login').findOne({_id : req.user._id},function(err, result){
        console.log(result)
        res.render('editmypage.ejs',{post:result})
        console.log(post)
    })
    
})

app.put('/editmypage',function(요청,응답){
    db.collection('login').updateOne({_id : 요청.user._id},
    { $set : {id: 요청.body.identi,/* pw: 요청.body.password,*/ born: 요청.body.born, sex: 요청.body.sex, address: 요청.body.address, number: 요청.body.number, email: 요청.body.email, email_b : 요청.body.edomain,smsyesno:요청.body.smsyesno,emailyesno:요청.body.emailyesno}},function(에러, 결과){
        console.log('수정완료')
        응답.redirect('/newpage')
    })
});
//---------------------------------------------------------------------------------------------------------------

//검색
function 로긴유무4(req, res, next){
    if(req.user){
        next()//있다면 통과
    }else{
        var 검색조건 = [
            {
              $search: {
                index: 'titleSearch',
                text: {
                  query: req.query.value,
                  path: '제목'//'제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                }
              }
            },
            //{ $sort: { _id : -1}},  //아이디순으로 정렬되서 출력
            { $limit: 10 }, // 10개만 검색가능
            //{$project : {제목: 1. _id:0, score:{$meta: "searchSCore"}}}  검색결과에서 필터링하기
        ] 
        db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
            console.log(결과)   
            res.render('search_nologin.ejs', {posts : 결과})
        })
    }
}

app.get('/search',로긴유무4,(요청,응답) => {//검색엔진 mongodb에서 텍스트 인덱싱을 해주어야함
    var 검색조건 = [
        {
          $search: {
            index: 'titleSearch',
            text: {
              query: 요청.query.value,
              path: '제목'//'제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
          }
        },
        //{ $sort: { _id : -1}},  //아이디순으로 정렬되서 출력
        { $limit: 10 }, // 10개만 검색가능
        //{$project : {제목: 1. _id:0, score:{$meta: "searchSCore"}}}  검색결과에서 필터링하기
    ] 
    db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
        console.log(결과)   
        응답.render('search.ejs', {posts : 결과})
    })
})


//---------------------------------------------------------------------------------------------------------------