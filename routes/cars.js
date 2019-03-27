const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');

/*get all cars*/
router.get('/',function (req,res) {
    const sql = "SELECT * FROM cars";
    connection.query(sql,function (err,result) {
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

router.get('/points',function (req,res) {
    let carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql ="SELECT * FROM points WHERE carId="+carId;
    connection.query(sql, function (err, result) {
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
                total:result.length,
                latest:result[result.length - 1],
                data: result
            })
        }
    })
})
module.exports = router;
