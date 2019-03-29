const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');

/*get all cars*/
router.get('/', function (req, res) {
    const sql = "SELECT * FROM cars";
    connection.query(sql, function (err, result) {
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
router.get('/userCars', function (req, res) {
    let userId = req.query.userId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE userId=" + userId;
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
                total: result.length,
                latest: result[result.length - 1],
                data: result
            })
        }
    })
});

/*get points*/
router.get('/points', function (req, res) {
    let carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM points WHERE carId=" + carId;
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
                total: result.length,
                latest: result[result.length - 1],
                data: result
            })
        }
    })
});


/*get points by user cars*/
router.get('/points/userCar', function (req, res) {
    let userId = req.query.userId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    let currentPage = req.query.currentPage.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    let pageSize= req.query.pageSize.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE userId=" + userId;
    const carSql = "SELECT * FROM points WHERE carId=";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('查询失败', err.message);
            res.send({
                status: 404,
                msg: '查询失败'
            });
            return
        }
        //console.log(result);
        let points = [];
        for (let index in result) {
            //console.log("carId="+result[index].carId);
            connection.query(carSql + result[index].carId, function (err, result) {
                if (err){
                    res.send({
                        status: 404,
                        msg: '查询失败'
                    });
                    return;
                }
                //console.log(result);
                points.push(result);
            });
        }
        setTimeout(function () {
            console.log(result.length);
            console.log(steamroller(points).length);
            let totalData =steamroller(points);
            let data=[];
            console.log(currentPage);
            if (currentPage>1){
                data = totalData.splice(pageSize*(currentPage-1),pageSize*currentPage);
            }else{
                data = totalData.splice(0,pageSize*currentPage);
            }
            //console.log(data);
            res.send({
                status: 200,
                msg: 'success',
                total:steamroller(points).length,
                data: data
            })
        },100)


    })
});
function steamroller (arr){
    // 1.创建一个新数组，保存扁平后的数据
    var newArr=[];
    // 2.for循环原数组
    for(var i=0;i<arr.length;i++){
        if(Array.isArray(arr[i])){
            // 如果是数组，调用steamroller 将其扁平化
            // 然后在push 到newArr中
            newArr.push.apply(newArr,steamroller(arr[i]))
        }else {
            // 反之 不是数组，直接push进newArr
            newArr.push(arr[i])
        }
    }
    // 3.返回新的数组
    return newArr
}
/*new car*/
router.post('/newCar', function (req, res) {
    let data = req.body;
    const sql = 'INSERT INTO cars(label,isOnline,userId,username) VALUES(?,?,?,?)';
    connection.query(sql, [data.label, 0, data.userId, data.username], function (err, result) {
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

/*update car*/
router.put('/update', function (req, res) {
    let data = req.body;
    var carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(data);
    var modSql = "UPDATE cars SET label=? WHERE carId=" + carId;
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

/*update car position*/
router.put('/update/position', function (req, res) {
    let data = req.body;
    var pointId = req.query.pointId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(data);
    var modSql = "UPDATE points SET position=? WHERE pointId=" + pointId;
    connection.query(modSql, [data.position], function (err, result) {
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
    var sql = "DELETE FROM cars WHERE carId=" + carId;
    connection.query(sql, function (err, result) {
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
