var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.redirect('login');
});

// 登录
router.use('/login', function(req, res, next) {
    if (req.method === 'GET') {
        // 验证是否已经登录过了
        if(req.session.user) {
            res.redirect('share');
        }else {
            res.render('wx/login');
        }
    }else {
        let {mobile, password} = req.body;
        res.render('wx/login', {message: '账户不存在！', mobile, password})
    }
});

// 注册
router.use('/register', function(req, res, next) {
    if (req.method === 'GET') {
        res.render('wx/register');
    }else {
        let {mobile, password, nickname, url} = req.body;
        let insertId = req.query('insert into t_user(`mobile`, `password`, `nickname`, `url`, `create_time`, `create_date`) values(?, ?, ?, ?, ?, ?)'
            , [mobile, password, nickname, url, ]);
        console.log(`注册成功, insertId=${insertId}`);
        res.redirect('login');
    }
});

// 分享页面
router.get('/share', function(req, res, next) {
  res.render('wx/share');
});

module.exports = router;
