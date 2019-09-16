const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');
const codeConfig = {
    size: 4,// 验证码长度
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    height: 44,
    noise: 3,
    color: true,
}
const singtrue = 'Chesterton';
let vertifyCode ='';
/* GET home page. */
router.get('/', function (req, res, next) {
    res.send(JSON.stringify("test"))
});

router.post('/login', function (req, res, next) {
    const data = req.body;
    console.log(data);
    const sql = "SELECT * FROM user WHERE username='" + data.username + "'";
    connection(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        let userinfo = JSON.stringify(result);
        userinfo = JSON.parse(userinfo);
        console.log(data.vertifycode !== vertifyCode);

        if (!data.isMobile && data.vertifycode !== vertifyCode) {
            res.send({
                status: 500,
                msg: '验证码错误'
            })
            return ;
        }
        if (result == '') {
            res.send({
                status: 501,
                msg: '没有此用户'
            })
        } else if (userinfo[0].password !== data.password) {
            //console.log(userinfo[0].password);
            res.send({
                status: 502,
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
    jwt.verify(token,singtrue,function (err,decoded) {
        if (err){
            console.log(err);
            res.send(401);
        }
        res.send(JSON.stringify(decoded));
    })
});
/*获取验证码*/
router.get('/getCode',function (req,res) {
    const  captcha = svgCaptcha.create(codeConfig);
    vertifyCode = captcha.text.toLowerCase();
    res.type('svg');
    res.send(captcha.data)
})
module.exports = router;
