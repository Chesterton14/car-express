const net = require('net');
const http = require('http');
const connection = require('../db/DBConfig');
const port = 8888;
const updateSql = "UPDATE cars SET isOnline=? WHERE carId=";
const addSql = 'INSERT INTO points(carId,lat,lng,time,label) VALUES(?,?,?,?,?)';
const carsSql = "SELECT * FROM cars";

const server = net.createServer((socket) => {
    console.log('new connected');
    socket.write('hello\r\n');
    let carId='';
    let label='';
    socket.on('data', (data) => {
        let oData = data.toString();
        let time = new Date().format("yyyy-MM-dd hh:mm:ss");
        console.log("接收数据"+time, oData);
        /*数据格式*/
        /*tcp*1$lng,lat*/
        let sign = oData.split('*')[0];
        if (sign === 'tcp' ) {
            let points =oData.split('$')[1];
            carId = oData.split('*')[1].split('$')[0];
            let lat = points.split(',')[1];
            let lng = points.split(',')[0];
            http.get('http://api.map.baidu.com/geoconv/v1/?coords='+lng+','+lat+'&from=1&to=5&ak=pzo9c3uMCP19ERmYH0yuyLQTaYxNcdTK', (res) => {
                const { statusCode } = res;
                const contentType = res.headers['content-type'];
                let error;
                if (statusCode !== 200) {
                    error = new Error('请求失败\n' + `状态码: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('无效的 content-type.\n' + `期望的是 application/json 但接收到的是 ${contentType}`);
                }
                if (error) {
                    console.error(error.message);
                    // 消费响应数据来释放内存。
                    res.resume();
                    return;
                }
                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        console.log(JSON.stringify(parsedData));
                        let bd_lng = parsedData.result[0].x;
                        let bd_lat = parsedData.result[0].y;
                        connection(updateSql + carId, [1], function (err, result) {
                            if (err) {
                                console.log('[UPDATE ERROR] - ', err.message);
                                return;
                            }
                            console.log('更新车辆状态为在线');
                        });
                        connection(carsSql, function (err, res) {
                            if (err) {
                                console.log('[SELECT ERROR] - ', err.message);
                                return;
                            }
                            for(let i in res){
                                if (res[i].carId == carId){
                                    label=res[i].label;
                                }
                            }
                            connection(addSql, [carId, bd_lat, bd_lng, time,label], function (err, result) {
                                if (err) {
                                    console.log('[INSERT ERROR] - ', err.message);
                                    return;
                                }
                                console.log("更新车辆信息成功");
                            })
                        });
                    } catch (e) {
                        console.error(e.message);
                    }
                });
            }).on('error', (e) => {
                console.error(`出现错误: ${e.message}`);
            });

        } else {
            console.log('不是TCP，过滤');
        }
    });
    socket.on('end', () => {
        console.log('disconnected');
        connection(updateSql + carId, [0], function (err, result) {
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
    //socket.pipe(socket);
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

