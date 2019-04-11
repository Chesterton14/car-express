const ws = require('nodejs-websocket');
const sqlconnection = require('../db/DBConfig');
const addSql = 'INSERT INTO points(carId,lat,lng,time) VALUES(?,?,?,?)';
const updateSql = "UPDATE cars SET isOnline=? WHERE carId=";
const port = 8869;

const server = ws.createServer(connection => {
    let carId;
    connection.on('text', function (res) {
        let time=new Date().format("yyyy-MM-dd hh:mm:ss");
        console.log('接收消息'+time , res);

        let data =JSON.parse(res);
        carId=data.carId
        sqlconnection.query(addSql,[data.carId,data.latitude,data.longitude,time],function (err,result) {
            if (err){
                console.log("[INSERT ERR]",err.sqlMessage);
                let err={
                    status:500,
                    msg:'error'
                };
                connection.send(JSON.stringify(err))
            }
            sqlconnection.query(updateSql + carId, [1], function (err, result) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    return;
                }
                console.log('更新车辆状态为在线');
            });
            let data={
                status:200,
                msg:'success'
            };
            connection.send(JSON.stringify(data))
        })
    });
    connection.on('connect', function (code) {
        console.log('开启连接', code);
        connection.send("连接成功");
    });
    connection.on('close', function (code) {
        console.log('关闭连接', code);
        sqlconnection.query(updateSql + carId, [0], function (err, result) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                return;
            }
            console.log('更新车辆状态为离线');
        });
    });
    connection.on('error', function (code) {
        console.log('异常关闭', code);
    });
});

server.listen(port,function () {
    console.log("Server listen on port:" + port);
});

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
