const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const {check, validationResult} = require('express-validator');

//データベースオブジェクトの取得
const db = new sqlite3.Database('mydb.sqlite3');


router.get('/', (req, res, next) => {
    //データベース処理の順次実行を行う
    db.serialize(() => {
        var rows = "";

        //レコードを一つずつ取り出す selectで列の指定
        db.each("select * from mydata", (err, row) => {
            if (!err) {
                rows += "<tr><th>" + row.id + "</th><td>" + row.name + "</td><td>"
                    + row.mail + "</td><td>" + row.age + "</td></tr>"
            }
        }
            , (err, count) => {             //each処理後の処理
                if (!err) {
                    const data = {
                        title: "My Database",
                        content: rows
                    };
                    res.render('mydatabase/index', data);
                }
            })
    })
})

router.get('/add', (req, res, next) => {
    const data = {
        title: 'Add database',
        content: '新しいコードを入力',
        form: {name:"", mail:"", age:0},
    };

    res.render('mydatabase/add', data);
})

// The Check function checks for validation.
//check("name", error message).method return ValidationChain obj. escape() = サニタイズ
router.post('/add', [check('name', 'NAME は必ず入力してください。').notEmpty().escape(),
check('mail', 'MAIL はメールアドレスを入力してください。').isEmail().escape(),
check('age', 'AGE は年齢（整数）を入力してください。').isInt().escape(),
check('age', 'AGE は18歳以上でなくてはなりません').custom(value => {
    return value >= 18;
})], 
(req, res, next) => {
    // Return obj which have ValidationChain objs.
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        let result = '<ul class="text-danger">';

        //Return error obj's array.
        const result_arr = errors.array();
        for(const errobj of result_arr){
            result += '<li>' + errobj.msg + '</li>'
        }
        result += '</ui>';

        const data = {
            title: 'Add database',
            content: result,
            form: req.body,
        }
        res.render('mydatabase/add', data);
    }

    else{
    //bodyから送信されたデータが(input<name="xxx">)name(key)と"xxx"(value)で保存されている
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;
    db.serialize(() => {
        db.run('insert into mydata (name,mail,age) values (?,?,?)',
            nm, ml, ag);
    });
    res.redirect('/mydtb');
    }

})

router.get('/show', (req, res, next) => {
    const urlQueryId = req.query.id;
    db.serialize(() => {
        const sqlQuery = "select * from mydata where ID = ?";
        db.get(sqlQuery, [urlQueryId], (err, row) => {
            if (!err) {
                const data = {
                    title: "Get Database",
                    content: "ID:" + urlQueryId + "のレコードを表示",
                    mydata: row,
                };
                res.render('mydatabase/show', data);
            };
        })
    })
})

router.get('/edit', (req, res, next) => {
    const urlQueryId = req.query.id;
    db.serialize(() => {
        const sqlQuery = "select * from mydata where ID = ?";
        db.get(sqlQuery, [urlQueryId], (err, row) => {
            if (!err) {
                const data = {
                    title: "Edit Database",
                    content: "ID:" + urlQueryId + "のレコードを編集",
                    mydata: row,
                };
                res.render('mydatabase/edit', data);
            };
        })
    })
})

router.post('/edit', (req, res, next) => {
    const id = req.body.id;
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;
    const sqlQuery = 'update mydata set name=?, mail=?, age=? where id = ?';

    //Formのsubmitイベントから受け取った値でDBを更新
    db.serialize(() => {
        db.run(sqlQuery, nm, ml, ag, id);
    });
    // /showにリダイレクトして更新したIDのレコードを表示する
    res.redirect('/mydtb');
})

router.get('/delete', (req, res, next) => {
    const urlQueryId = req.query.id;
    db.serialize(() => {
        const sqlQuery = "select * from mydata where ID = ?";
        db.get(sqlQuery, [urlQueryId], (err, row) => {
            if (!err) {
                const data = {
                    title: "Delete Database",
                    content: "ID:" + urlQueryId + "のレコードを削除",
                    mydata: row,
                };
                res.render('mydatabase/delete', data);
            };
        })
    })
})

router.post('/delete', (req, res, next) => {
    const id = req.body.id;

    db.serialize(() => {
        const sqlQuery = 'delete from mydata where id = ?';
        db.run(sqlQuery, id);
    });
    res.redirect('/mydtb');
})

router.get('/find', (req,res,next) => {
    db.serialize(() => {
        const sqlQuery = 'select * from mydata';
        db.all(sqlQuery, (err,rows) => {
            if (!err) {
                const data = {
                    title: "Find Database",
                    content: "検索条件: ",
                    mydata: rows,
                };
                res.render('mydatabase/find', data);
        }})
        })
})

router.post('/find', (req,res,next) => {
    const whereInQuery = req.body.find;
    let dbArray = [];

    db.serialize(() => {
        const sqlQuery = "select * from mydata where " + whereInQuery;

        db.all(sqlQuery, (err,rows) => {
            if (!err) {
                const data = {
                    title: "Find Database",
                    content: "検索条件: ",
                    mydata: rows,
                };
                res.render('mydatabase/find', data);
        }})
        })
})

module.exports = router;