const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post("/nodemailerTest", function(req, res, next){
  let email = req.body.email;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jo8020173@gmail.com',  // gmail 계정 아이디를 입력
      pass: 'jongbeom1*'          // gmail 계정의 비밀번호를 입력
    }
  });

  let mailOptions = {
    from: 'jo8020173@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    to: email ,                     // 수신 메일 주소
    subject: 'Sending Email using Node.js',   // 제목
    html: '<p>아래의 링크를 클릭해주세요 !</p>' +
      "<a href='http://localhost:3000/auth/?email="+ email +"&token=abcdefg'>인증하기</a>"  // 내용
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.redirect("/");
})

router.get("/auth", function(req, res, next){
    let email = req.query.email;
    let token = req.query.token;
    if(token=='abcdefg'){
        res.redirect("/makeid");
    }
    // token이 일치하면 테이블에서 email을 찾아 회원가입 승인 로직 구현
  })

module.exports = router;