const ws = require('nodejs-websocket');
const sqlconnection = require('../db/DBConfig');
const sql = "SELECT * FROM points WHERE carId=";
const port = 8867;

const server = ws.createServer(connection => {
    connection.on('text', function (res) {
        console.log('接收消息'+ new Date().format("yyyy-MM-dd hh:mm:ss"), res);
        let carId = res.split('=')[1];
        if (res === 'ping'){
            console.log('心跳');
        }else{
            sqlconnection.query(sql+carId,function (err,result) {
                if (err){
                    console.log("查询错误");
                    let err ={
                        msg:'no msg'
                    };
                    connection.send(JSON.stringify(err));
                    return;
                }
                let data ={
                    msg: '查找车辆成功！',
                    latest:result[result.length - 1],
                };
                connection.send(JSON.stringify(data));
            })
        }
    });
    connection.on('connect', function (code) {
        console.log('开启连接', code);
        connection.send("连接成功");
    });
    connection.on('close', function (code) {
        console.log('关闭连接', code);
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
