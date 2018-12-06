var express = require('express');
var router = express.Router();
const mysql = require('mysql');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.redirect('login');
});

// 登录
router.get('/login', function(req, res, next) {
  res.render('wx/login');
});

// 注册
router.get('/register', function(req, res, next) {
  res.render('wx/register');
});

// 分享页面
router.get('/share', function(req, res, next) {
  res.render('wx/share');
});

module.exports = router;
