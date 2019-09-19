const express = require('express')
const router = express.Router()
const connection = require('../db/DBConfig')

router.get('/part',function(req,res){
    const sql = 'SELECT * FROM trainNote_part'
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
})

router.get('/action',function(req,res){
    const partId = req.query.partId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM trainNote_action WHERE partId=" + partId;
    connection(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.send(404);
            return;
        }
        if (result == '') {
            res.send({
                status: 500,
                msg: '无此车辆数据！'
            })
        } else {
            res.send({
                status: 200,
                msg: '查找车辆成功！',
                data: result
            })
        }
    })
})

module.exports = router;