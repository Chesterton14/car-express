const ws = require('nodejs-websocket');
const sqlconnection = require('../db/DBConfig');
const addSql = 'INSERT INTO points(carId,lat,lng,time,label,tm,ag,speed) VALUES(?,?,?,?,?,?,?,?)';
const updateSql = "UPDATE cars SET isOnline=? WHERE carId=";
const port = 8869;
const carsSql = "SELECT * FROM cars";

const server = ws.createServer(connection => {
    let carId;
    let label;
    connection.on('text', function (res) {
        let time=new Date().format("yyyy-MM-dd hh:mm:ss");
        let unixtime = new Date().getTime();
        console.log('接收消息'+time , res);

        let data =JSON.parse(res);
        carId=data.carId
        sqlconnection(carsSql,function (err,res) {
            if (err){
                console.log("[SELECT ERROR]" ,err.sqlMessage)
            }
            for(let i in res){
                if (res[i].carId == carId){
                    label=res[i].label;
                }
            }
            let {bd_lat,bd_lon}=bd_encrypt(data.latitude,data.longitude)
            sqlconnection(addSql,[data.carId,bd_lat,bd_lon,time,label,unixtime,data.ag,data.speed],function (err,result) {
                if (err){
                    console.log("[INSERT ERR]",err.sqlMessage);
                    let err={
                        status:500,
                        msg:'error'
                    };
                    connection.send(JSON.stringify(err))
                }
                sqlconnection(updateSql + carId, [1], function (err, result) {
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
        })

    });
    connection.on('connect', function (code) {
        console.log('开启连接', code);
        connection.send("连接成功");
    });
    connection.on('close', function (code) {
        console.log('关闭连接', code);
        sqlconnection(updateSql + carId, [0], function (err, result) {
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

function bd_encrypt(gg_lat,gg_lon){
    /*gcj02坐标转百度坐标*/
    let pi_value=Math.PI;
    let X_PI = pi_value * 3000.0 / 180.0;
    let x = gg_lon, y = gg_lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
    let bd_lon = z * Math.cos(theta) + 0.0065;
    let bd_lat = z * Math.sin(theta) + 0.006;
    return {
        bd_lat: bd_lat,
        bd_lon: bd_lon
    };
};

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
