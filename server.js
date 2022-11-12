//서버 mongoDB: jo8020173@outlook.kr // jongbeom1* //p-db cho1//jk007456
//express library 사용
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true})) //post요청을 위해
const MongoClient = require('mongodb').MongoClient;//mongodb 사용
app.set('view engine', 'ejs'); //ejs 사용 헤더
app.use('/public', express.static('public')) //미들웨어, public폴더를 사용 (css파일관련)
app.use(express.static('views')); //사진
app.use('/uploads', express.static('uploads'));
require('dotenv').config()//env환경변수 선언
const methodOverride = require('method-override')// 메소드 오버라이드1
app.use(methodOverride('_method'))//메소드 오버라이드2
let multer = require('multer'); //multer라이브러리 사용

var db;
MongoClient.connect(process.env.DB_URL,function(err, client){
    if(err) return console.log(err)
    db = client.db('p-db');
    app.listen(process.env.PORT,function(){
        console.log('listening on 3000')
    });
})

app.get('/', function(req, res){
    res.render('homepage.ejs');//res.sendFile(__dirname+'/~.html)
});

app.get('/install', function(req, res){
    res.render('install.ejs');
});

app.get('/index', function(req, res){
    res.render('check-email.ejs');
});
app.use('/',require('./routes/index.js'));//이메일 라우트 사용

app.get('/makeid', function(req, res){
    res.render('makeid.ejs');
});
app.get('/editmypage', function(req, res){
    res.render('editmypage.ejs');
});




// 파일저장, 램에다가 저장해주세요--------------------------------------------------------------------------------
var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, './public/image')
    },
    filename : function(req, file, cb){
        cb(null, file.originalname)
    }
}); 
var upload = multer({storage : storage});

app.get('/upload', function(req,res){//이미지저장
    res.render('upload.ejs')
})

app.post('/upload', upload.single('profile'), function(req, res){
    res.send('succeed')
});

// app.get('/image/:이미지이름', function(req,res){
//     res.sendFile(__dirname+'/public/image/'+res.params.이미지이름)
// })
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
//------------------------------------------------------------------------newpage
app.post('/login', passport.authenticate('local',{
    failureRedirect : 'fail' //로긴 실패시 fail경로로 보내짐
}), function(req, res){
    res.redirect('/newpage') //로긴 성공시 '/' 로 보내짐
});

app.get('/newpage', 로긴유무 ,function(req, res){//mypage에 접속하면 로긴유무 함수 발동
    console.log(req.user);
    res.render('newpage.ejs',{ user: req.user})
})
//------------------------------------------------------------------------
app.get('/mypage', 로긴유무 ,function(req, res){//mypage에 접속하면 로긴유무 함수 발동
    console.log(req.user);
    res.render('mypage.ejs',{ user: req.user})
})

app.get('/write', 로긴유무, function(req, res){
    res.render('write.ejs');    
});

app.get('/list', 로긴유무2, function(req, res){
    db.collection('post').find().toArray(function(err,result){
        console.log(result);
        res.render('list.ejs', { posts : result});
    });
});
app.get('/detail/:id', 로긴유무3, function(req,res){//detail/~로 get요청을 하면~
    db.collection('post').findOne({_id:parseInt(req.params.id)},function(err, result){
        console.log(result);
        res.render('detail.ejs',{ data :result});
    })
    
})

//------------------------------------------------------------------------
function 로긴유무(req, res, next){
    if(req.user){
        next()//있다면 통과
    }else{
        res.render('login.ejs');
    }
}
function 로긴유무2(req, res, next){//로그인을 하지않을시
    if(req.user){
        next()//있다면 통과
    }else{
        db.collection('post').find().toArray(function(err,result){
            console.log(result);
            res.render('list-nologin.ejs', { posts : result});
        });
    }
}
function 로긴유무3(req, res, next){//로그인을 하지않을시detail
    if(req.user){
        next()//있다면 통과
    }else{
        db.collection('post').findOne({_id:parseInt(req.params.id)},function(err, result){
            console.log(result);
            res.render('detail-nologin.ejs',{ data   :result});
        })
    }
}


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
app.post('/register', function(req,res){
    db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw, _id: req.body.id, born: req.body.born, sex: req.body.sex, address: req.body.address, number: req.body.number, email: req.body.email
    }, function(err,result){
        res.redirect('/login')
    })
})

//어떤 사람이 /add 경로로 post요청을 하면 ~를 해주세요
app.post('/add', function(req,res){//정보는 요청 부분에 저장되어있음
    res.render('homepage.ejs');//post기능을 사용하기 위해선 app.use(express.urlencoded({extended: true})) 삽입필요
    db.collection('counter').findOne({name:'게시물갯수'}, function(err,result){
        console.log(result.totalPost) // () -> 총게시물갯수
        var 총게시물갯수 = result.totalPost;
        var saver = {_id : 총게시물갯수 +1, id: req.user.id, 제목 : req.body.title, 내용 : req.body.descript}
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
        var deldata = {_id: req.body._id}
        db.collection('post').deleteOne(deldata,function(err, result){
        console.log('delete succeed');
        if(err) {console.log(err)}
        res.status(200).send({message:'succeed'});
    })
    }
    
})

//---------------------------------------------------------------------------------------------------------------

//detail 로 접속하면 detail.ejs보여줌


// edit.ejs파일에 내가 접속한경로의 아이디를 찾은후 쏴준다 
app.get('/edit/:id',function(req, res){
    db.collection('post').findOne({_id:parseInt(req.params.id)},function(err, result){
        console.log(result)
        res.render('edit.ejs',{post:result})
    })
    
})//put 요청을 하면, 요청.bodyid를 db에서 찾은후 제목과 날짜를 업데이트해준다

app.put('/edit',function(요청,응답){
    db.collection('post').updateOne({_id : parseInt(요청.body.id)},
    { $set : {제목: 요청.body.title ,내용: 요청.body.descript}},function(에러, 결과){
        console.log('수정완료')
        응답.redirect('/list')
    })
});
//---------------------------------------------------------------------------------------------------------------

app.put('/editmypage',function(요청,응답){
    db.collection('login').updateOne({_id : 요청.user._id},
    { $set : {id: 요청.body.identi, pw: 요청.body.password, born: 요청.body.born, sex: 요청.body.sex, address: 요청.body.address, number: 요청.body.number, email: 요청.body.email}},function(에러, 결과){
        console.log('수정완료')
        응답.redirect('/newpage')
    })
});
//---------------------------------------------------------------------------------------------------------------

//검색
app.get('/search',(요청,응답) => {//검색엔진 mongodb에서 텍스트 인덱싱을 해주어야함
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