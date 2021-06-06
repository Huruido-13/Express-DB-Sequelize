const express = require('express');
const router = express.Router();
const db = require('../models/index');
const {Op} = require("sequelize");

/* GET users listing. */
router.get('/', (req, res, next)=> {
  db.User.findAll({
  }).then(usrs => {
    let data = {
      title: 'Users/Index',
      content: usrs,
    }
    res.render('users/index',data);
  })
});

router.get('/add', (req,res,next) => {
  const data = {
    title: 'Users/Add',
    from: new db.User(),
    err:null
  };
  res.render('users/add', data);
})

router.post('/add', (req,res,next) =>{
  const form = {
    name: req.body.name,
    pass: req.body.password,
    mail: req.body.mail,
    age: req.body.age,
  };
  db.sequelize.sync().then(() => db.User.create(form)
  .then(usr => {
    res.redirect('/users');
  }).catch(err => {
    const data = {
      title: 'Users/Add',
      form: form,
      err: err
    }
    res.render('users/add',data);
  }))})

router.get('/edit', (req,res,next) => {
  const urlQueryId = req.query.id;
  db.User.findByPk(urlQueryId).then(usr => {
    const data = {
      title: 'User/Edit',
      form: usr,
    };
    res.render('users/edit', data);
  })
})

router.post('/edit', (req,res,next) => {
  db.sequelize.sync().then(() => db.User.update(
    {
      name: req.body.name,
      pass: req.body.pass,
      mail: req.body.mail,
      age: req.body.age,
    },
    {
      where:{id:req.body.id}
    }
  )).then( usr => {
    res.redirect('/users');
})
})

router.get('/delete', (req,res,next) => {
  const urlQueryId = req.query.id;
  db.User.findByPk(urlQueryId).then(usr => {
    const data = {
      title: 'User/delete',
      form: usr,
    };
    res.render('users/delete', data);
  })
})

router.post('/delete', (req,res,next) => {
  db.sequelize.sync().then(() => db.User.destroy({where:{id:req.body.id}})).then(user =>{
    res.redirect('/users');
  })
  
})


module.exports = router;