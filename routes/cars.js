const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');
const timeSelect = require('../js/timeSelect')
/*get all cars*/
router.get('/', function (req, res) {
    const sql = "SELECT * FROM cars";
    connection(sql, function (err, result) {
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
    const userId = req.query.userId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE userId=" + userId;
    connection(sql, function (err, result) {
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

/*search car*/
router.post('/search', function (req, res) {
    const data = req.body
    //console.log(data);
    const sql = "SELECT * FROM points WHERE carId=" + data.carId;
    connection(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            res.send(404);
            return;
        }
        let points = JSON.stringify(result)
        points = JSON.parse(points)
        let selectData = timeSelect(points, data.startTime, data.endTime)
        //console.log(selectData);
        if (selectData != ''){
            res.send({
                status: 200,
                msg: '查找车辆成功！',
                total: selectData.length,
                data: selectData
            })
        }else{
            res.send({
                status: 500,
                msg: '无此车辆数据！'
            })
        }


    })
})

/*get points*/
router.get('/points', function (req, res) {
    const carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM points WHERE carId=" + carId;
    connection(sql, function (err, result) {
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
            return
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
    const userId = req.query.userId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const currentPage = req.query.currentPage.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const pageSize = req.query.pageSize.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE userId=" + userId;
    const carSql = "SELECT * FROM points WHERE carId=";
    const carsSql = "SELECT * FROM cars";
    let error=false
    connection(sql, function (err, result) {
        if (err) {
            console.log('查询失败', err.message);
            res.send({
                status: 404,
                msg: '查询失败'
            });
            return
        }
        let points = [];
        result = JSON.stringify(result);
        result= JSON.parse(result)
        for (let i=0;i<result.length;i++) {
            connection(carSql + result[i].carId, function (err, poingtRes) {
                if (err) {
                    //console.log('查询失败', err.message);
                    error=true
                    return
                };
                points.push(poingtRes);
            });
        }
        setTimeout(function () {
            if (error===true){
                res.send({
                    status: 500,
                    msg: 'error',
                })
                return
            }
            error=false
            let totalData = steamroller(points);
            let data = [];
            if (currentPage > 1) {
                data = totalData.slice(pageSize * (currentPage - 1), pageSize * currentPage);
            } else {
                data = totalData.slice(0, pageSize * currentPage);
            }
            res.send({
                status: 200,
                msg: 'success',
                total: steamroller(points).length,
                dataLength: data.length,
                data: data
            })
        }, 300)


    })
});


/*new car*/
router.post('/newCar', function (req, res) {
    const data = req.body;
    const sql = 'INSERT INTO cars(label,isOnline,userId,username) VALUES(?,?,?,?)';
    connection(sql, [data.label, 0, data.userId, data.username], function (err, result) {
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
    const data = req.body;
    const carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const modSql = "UPDATE cars SET label=? WHERE carId=" + carId;
    connection(modSql, [data.label], function (err, result) {
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
    const data = req.body;
    const pointId = req.query.pointId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const modSql = "UPDATE points SET position=? WHERE pointId=" + pointId;
    connection(modSql, [data.position], function (err, result) {
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
    const carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "DELETE  FROM cars WHERE carId=" + carId;
    connection(sql, function (err, result) {
        if (err) {
            console.log('[ ERROR] - ', err.message);
            res.send(404);
            return;
        }
        res.send({
            status: 200,
            msg: 'success',
        })
    })
});

/*get car by carId*/
router.get('/car', function (req, res) {
    const carId = req.query.carId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    const sql = "SELECT * FROM cars WHERE carId=" + carId;
    connection(sql, function (err, result) {
        if (err) {
            console.log('[ERROR] - ', err.message);
            res.send(404);
            return;
        }
        res.send({
            status: 200,
            data: result,
            msg: 'success',
        })
    })
})

module.exports = router;

function steamroller(arr) {
    // 1.创建一个新数组，保存扁平后的数据
    let newArr = [];
    // 2.for循环原数组
    for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            // 如果是数组，调用steamroller 将其扁平化
            // 然后在push 到newArr中
            newArr.push.apply(newArr, steamroller(arr[i]))
        } else {
            // 反之 不是数组，直接push进newArr
            newArr.push(arr[i])
        }
    }
    // 3.返回新的数组
    return newArr
}
