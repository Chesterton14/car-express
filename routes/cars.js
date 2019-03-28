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

/*get user cars*/
router.get('/userCars',function (req,res) {
    let userId = req.query.userId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE userId="+userId;
    connection.query(sql,function (err,result) {
        if (err){
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
});

/*get points*/
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
});

/*new car*/
router.post('/newCar',function (req,res) {
    let data = req.body;
    const sql='INSERT INTO cars(label,isOnline,userId,username) VALUES(?,?,?,?)';
    connection.query(sql,[data.label,0,data.userId,data.username],function (err,result) {
        if (err){
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

/*update car*/
router.put('/update',function (req,res) {
   let data = req.body;
    var carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(data);
    var modSql = "UPDATE cars SET label=? WHERE carId="+carId;
    connection.query(modSql, [data.label], function (err, result) {
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

/*delete car by carId*/
router.delete('/delete', function (req, res) {
    var carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(req.query);
    var sql = "DELETE FROM cars WHERE carId="+carId;
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
