const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');
//connection.connect();

/* get all users */
router.get('/', function (req, res, next) {
    const sql = 'SELECT * FROM user';
    connection(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR]:', err.message);
        }
        res.send({
            status: 200,
            data: result,
            msg: 'success'
        });
    });
});

/* new user */
router.post('/new', function (req, res, next) {
    const data = req.body;
    console.log(data);
    const sqlusername = "SELECT * FROM user WHERE username='" + data.username + "'";
    connection(sqlusername, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (result == '') {
            const addSql = 'INSERT INTO user(username,password,comId,roleId) VALUES(?,?,?,?)';
            connection(addSql, [data.username, data.password,data.comId,data.roleId], function (err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    res.send({
                        status: 500,
                        msg: 'error'
                    });
                    return;
                }
                res.send({
                    status: 200,
                    msg: '新增用户成功！'
                })
            });
        } else {
            res.send({
                status: 500,
                msg: '用户名已存在！'
            })
        }
    });
});

/* search user by id*/
router.get('/finduser', function (req, res, next) {
    const data = req.query.id.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM user WHERE id='" + data + "'";
    connection(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (result == '') {
            res.send({
                status: 500,
                msg: 'Not found'
            })
        } else {
            res.send({
                status: 200,
                msg: 'success',
                data: result
            })
        }
    })
});

/* update user */
router.put('/update',function (req,res,next) {
    const data = req.body ;
    const id = req.query.id.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const modSql = "UPDATE user SET password=?,comId=?,username =?,roleId=? WHERE id = "+id;
    connection(modSql,[data.password,data.comId,data.username,data.roleId],function (err,result) {
        if (err){
            console.log('[UPDATE ERROR] - ',err.message);
            res.send({
                status:500,
                msg:'更新用户信息失败！',
            })
            return;
        }
        res.send({
            status:200,
            msg:'更新用户信息成功！',
        })
    })
});

/* delete user */
router.delete('/delete',function (req,res) {
    const id = req.query.id.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "DELETE FROM user WHERE id="+id;
    connection(sql,function (err,result) {
        if (err) {
            console.log('[DELETE ERROR] - ', err.message);
            res.send(404);
            return;
        }
        res.send({
            status: 200,
            msg: 'success',
        })
    })
});

module.exports = router;
