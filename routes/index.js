const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');
const jwt = require('jsonwebtoken');

const singtrue = 'Chesterton';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send(JSON.stringify("test"))
});

/* login api */
router.post('/login', function (req, res, next) {
    const data = req.body;
    //console.log(data);
    const sql = "SELECT * FROM user WHERE username='" + data.username + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        let userinfo = JSON.stringify(result);
        userinfo = JSON.parse(userinfo);
        console.log(userinfo);

        if (result == '') {
            res.send({
                status: 500,
                msg: '没有此用户'
            })
        } else if (userinfo[0].password !== data.password) {
            //console.log(userinfo[0].password);
            res.send({
                status: 500,
                msg: '密码错误'
            })
        } else {
            /* 定义token */
            const token = jwt.sign({
                user_id: userinfo[0].id,
                user_name: userinfo[0].username,
                userRole:userinfo[0].roleId
            }, singtrue, {expiresIn: 60 * 60});
            res.send({
                status: 200,
                msg: '登录成功，欢迎进入',
                token,
                data: userinfo[0]
            })
        }
    })
});
/* 验证登录状态 */
router.get('/profile', function (req, res, next) {
    const authorization = req.headers.authorization;
    if (authorization === '') {
        res.send(401, 'no token detected in http header "Authorization"')
    }
    const token = authorization.split(' ')[1];
    //console.log(token);
    jwt.verify(token,singtrue,function (err,decoded) {
        if (err){
            console.log(err);
            res.send(401);
        }
        //console.log(decoded);
        res.send(JSON.stringify(decoded));
    })
    /*let tokenContent;
    try {
        tokenContent = jwt.verify(token, 'chesterton');     //如果token过期或验证失败，将抛出错误
        console.log(tokenContent);
        res.send(tokenContent)
    } catch (err) {
        res.send(401, 'invalid token');
    }*/
});

module.exports = router;
