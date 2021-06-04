const express = require('express');
const http = require('https');
const parseString = require('xml2js').parseString;
const router = express.Router();



// /hello以下の相対アドレスを第一引数で指定して/hello～のアクセスがあった場合に分岐させる
router.get('/', function(req, res, next) {
    let msg = "Enter something";

    if(req.session.message != undefined){
        msg =  "Last Message: " + req.session.message
    }

    let opt = {
        host: 'news.google.com',
        port: 443,
        path: '/rss?hl=ja&ie=UTF-8&oe=UTF-8&gl=JP&ceid=JP:ja'
    };

    http.get(opt, (res2) => {
        let body = "";
        res2.on('data', (data) => {
            body += data;
        });
        res2.on('end', () =>{
            parseString(body.trim(), (err, result) => {
                console.log(result);
                let data = {
                    title: "Google News",
                    content: result.rss.channel[0].item,
                    lastMessage: msg
                };
                res.render('hello', data);
            })
        })
    }
    );



    

});

//POSTアクセスの処理を行う　例：formから送信
router.post('/post' ,(req, res, next) => {
    //POST送信された値はreq.bodyにオブジェクトとしてまとめられている
    console.log(req.body);
    msg = req.body["message"];
    req.session.message = msg;
    console.log(req.session.message);
    const data = {
        title: "Hello!",
        lastMessage: msg,
        content:null
    }

    res.render('hello', data);
})

// /postのgetアクセス処理
router.get('/post' ,(req, res, next) => {
    console.log(req.session.message);
    const data = {
        title: "Hello!",
        lastMessage: msg,
        content: null
    }

    res.render('hello', data);
})

module.exports = router;
