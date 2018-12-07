var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const mysql = require('mysql');
const mysqlConfig = {
    connectionLimit : 10,
    host            : 'cdb-mfvloj2i.cd.tencentcdb.com',
    user            : 'beile',
    password        : '9!Q!C2Xgwhkb',
    database        : 'beile',
    port            : 10019
};

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var wxRouter = require('./routes/wx');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// mysql
// 使用 session 中间件
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    },
}));
console.log('启用mysql pool...');
const pool = mysql.createPool(mysqlConfig);
app.use(function(req, res, next){
    req.query = (sql, params) => new Promise((resolve, reject) => {
        // 获取数据库连接
        console.debug('[SQL] get connection...');
        pool.getConnection((err, connection) => {
            let threadId = connection.threadId;
            if(err) {
                console.error(`[SQL ERROR ${threadId}] ${err}`);
                reject(err);
            }else {
                // 连接成功
                console.log(`[SQL QUERY ${threadId}] ${sql}`);
                console.log(`[SQL PARAMS ${threadId}] [${params}]`);
                connection.query(sql, params, (error, results, fields) => {
                    connection.release();
                    if (error) {
                        console.error(`[SQL QUERY ERROR ${threadId}] ${error}`);
                        reject(error);
                    }else {
                        // 执行成功
                        /**
                         FieldPacket {
                            catalog: 'def',
                            db: 'beile',
                            table: 't_user',
                            orgTable: 't_user',
                            name: 'id',
                            orgName: 'id',
                            charsetNr: 63,
                            length: 11,
                            type: 3,
                            flags: 16899,
                            decimals: 0,
                            default: undefined,
                            zeroFill: false,
                            protocol41: true }
                         */
                        //判断执行类型
                        if(sql.trim().toUpperCase().substr(0, 6) === 'SELECT') {
                            let myfields = fields.map(entity => entity.name);
                            console.log(`[SQL FIELDS ${threadId}] [${myfields}]`);
                            console.log(`[SQL RESULT ${threadId}] ${results.length}`);
                            results.forEach((entity, idx) => console.log(`[SQL RESULT ROW ${threadId}-${idx}] ${JSON.stringify(entity)}`))
                            // 查询语句
                            if (fields.length === 1) {
                                resolve(results[0][myfields[0]]);
                            }else {
                                resolve(results);
                            }
                        }else {
                            // 非查询语句
                            console.log(`[SQL AFFECT ${threadId}] ${JSON.stringify(results)}`)
                            // 当为insert语句是insertId不为0，affectedRows也不为0，当为delete和update是无insertId
                            resolve(results.insertId || results.affectedRows);
                        }
                    }
                });
            }
        });
    });
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wx', wxRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
