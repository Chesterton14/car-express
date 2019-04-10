const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');
//connection.connect();
function handleDisconnection() {
    connection.connect(function(err) {
        if(err) {
            setTimeout(function(){
                handleDisconnection();
            }, 2000);
        }
    });

    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('db error执行重连:'+err.message);
            handleDisconnection();
        } else {
            console.log(err);

        }
    });
}
handleDisconnection();
/* get all users */
router.get('/', function (req, res, next) {
    const sql = 'SELECT * FROM user';
    connection.query(sql, function (err, result) {
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
    connection.query(sqlusername, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (result == '') {
            const addSql = 'INSERT INTO user(username,password,comId,roleId) VALUES(?,?,?,?)';
            connection.query(addSql, [data.username, data.password,data.comId,data.roleId], function (err, result) {
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
    //console.log(data);
    const sql = "SELECT * FROM user WHERE id='" + data + "'";
    connection.query(sql, function (err, result) {
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
    console.log(id,data);
    const modSql = "UPDATE user SET password=?,comId=?,username =?,roleId=? WHERE id = "+id;
    connection.query(modSql,[data.password,data.comId,data.username,data.roleId],function (err,result) {
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
    console.log(id);
    const sql = "DELETE FROM user WHERE id="+id;
    connection.query(sql,function (err,result) {
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
