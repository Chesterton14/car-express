const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');

router.get('/search',function (req,res) {
    const mobileId = req.query.mobileId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE mobileId=" + mobileId;
    connection.query(sql,function (err,result) {
        if (err){
            console.log("[SELECT ERR]", err);
            res.send({
                status:500,
                msg:'错误'
            });
            return;
        }
        res.send({
            status:200,
            msg:'查询设备成功',
            data:result
        })
    })
});

router.post('/new',function (req,res) {
    const data = req.body;
    console.log(data);
    const sql = 'INSERT INTO cars(label,isOnline,userId,isMobile,mobileId) VALUES(?,?,?,?,?)';
    connection.query(sql,[data.label,0,data.userId,1,data.mobileId],function (err,result) {
        if (err){
            console.log("[INSERT ERR]",err);
            res.send({
                status:500,
                msg:'错误'
            });
            return;
        }
        res.send({
            status:200,
            msg:'新增移动设备成功'
        })
    });
});

router.post('/data',function (req,res) {
    const data = req.body;
    const sql='INSERT INTO points(lat,lng,carId,time) VALUES(?,?,?,?)';
    connection.query(sql,[data.lat,data.lng,data.carId,data.time],function (err,result) {
        if (err){
            console.log("[INSERT ERR]",err);
            res.send({
                status:500,
                msg:'错误'
            });
            return;
        }
        res.send({
            status:200,
            msg:'新增数据成功'
        })
    })
});


module.exports = router;
