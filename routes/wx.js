var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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
