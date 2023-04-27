//express library 사용
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) //post요청을 위해

const mysql = require('mysql2'); //mysql 사용
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


//---------------------------------------------------------------------------------------------------------------

