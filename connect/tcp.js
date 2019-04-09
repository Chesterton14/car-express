const net = require('net');
const connection = require('../db/DBConfig');
const port = 8868;
const updateSql = "UPDATE cars SET isOnline=? WHERE carId=";
const addSql = 'INSERT INTO points(carId,lat,lng,time) VALUES(?,?,?,?)';

const server = net.createServer((socket) => {
    console.log('new connected');
    socket.write('hello\r\n');
    let carId='';
    socket.on('data', (data) => {
        let oData = data.toString();
        console.log("接收数据", oData);
        /*数据格式*/
        /*tcp$carId,lat,lng*/
        let sign = oData.split('$')[0];
        let time = new Date().format("yyyy-MM-dd hh:mm:ss");
        //console.log(sign, "carId:" + carId, "lat:" + lat, "lng:" + lng);
        if (sign === 'tcp') {
            carId = oData.split('$')[1].split(',')[0];
            let lat = oData.split('$')[1].split(',')[1];
            let lng = oData.split('$')[1].split(',')[2];
            connection.query(updateSql + carId, [1], function (err, result) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    return;
                }
                console.log('更新车辆状态为在线');
            });
            connection.query(addSql, [carId, lat, lng, time], function (err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    return;
                }
                console.log("更新车辆信息成功");
            })
        } else {
            connection.query(updateSql + carId, [0], function (err, result) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    return;
                }
                console.log('更新车辆状态为离线');
            });
        }
    });
    socket.on('end', () => {
        console.log('disconnected');
        connection.query(updateSql + carId, [0], function (err, result) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                return;
            }
            console.log('更新车辆状态为离线');
        });
    });
    socket.on('error',(err)=>{
        console.log(err);
    })
    socket.pipe(socket);
});
server.on('error', (err) => {
    console.log(err);
});
server.listen(port, () => {
    console.log('Server start on port:' + port);
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

