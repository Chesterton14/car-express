const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');

/* get all company */
router.get('/', function (req, res, next) {
    const sql = "SELECT * FROM company";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR]:', err.message);
        }
        res.send({
            status: 200,
            msg: 'success',
            data: result
        })
    })
});

/* 新增公司 */
router.post('/new', function (req, res, next) {
    var data = req.body;
    //console.log(data.comName);
    const sql = "SELECT * FROM company WHERE comName='" + data.comName + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.send(404);
            return;
        }
        if (result == '') {
            const addSql = 'INSERT INTO company(comName,comPhone,comAddress) VALUES(?,?,?)';
            connection.query(addSql, [data.comName, data.comPhone, data.comAddress], function (err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    res.send({
                        status: 500,
                        msg: 'success'
                    });
                    return;
                }
                res.send({
                    status: 200,
                    msg: '新增公司成功！'
                })
            });
        } else {
            res.send({
                status: 500,
                msg: '此公司已存在！'
            })
        }
    })
});

/* 根据公司名查找 */
router.get('/search', function (req, res, next) {
    //var data = req.body;
    //console.log(req.query);
    var data = req.query.comId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');

    console.log(data);
    const sql = "SELECT * FROM company WHERE comId='" + data + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.send(404)
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

/* 更新公司信息 */
router.put('/update', function (req, res, next) {
    var data = req.body;
    var comId = req.query.comId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(data);
    var modSql = "UPDATE company SET comPhone=?,comAddress=? ,comName =? WHERE comId="+comId;
    connection.query(modSql, [data.comPhone, data.comAddress, data.comName], function (err, result) {
        if (err) {
            console.log('[UPDATE ERROR] - ', err.message);
            res.send(404);
            return;
        }
        res.send({
            status: 200,
            msg: 'success',
        })
    })
});

/*根据公司名删除公司*/
router.delete('/delete', function (req, res) {
    var comId = req.query.comId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(comId);
    var sql = "DELETE FROM company WHERE comId="+comId;
    connection.query(sql,  function (err, result) {
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
