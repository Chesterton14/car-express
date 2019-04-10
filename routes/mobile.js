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
        if(result != ''){
            res.send({
                status:200,
                msg:'查询设备成功',
                data:result
            })
        }else{
            res.send({
                status:500,
                msg:'错误'
            });
        }

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
    let time = new Date().format("yyyy-MM-dd hh:mm:ss");
    connection.query(sql,[data.lat,data.lng,data.carId,time],function (err,result) {
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

Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
