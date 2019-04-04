const express = require('express');
const router = express.Router();
const connection = require('../db/DBConfig');


/*get all roles*/
router.get('/',function (req,res) {
    const sql = 'SELECT * FROM role';
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR]:', err.message);
        }
        res.send({
            status: 200,
            data: result,
            msg: 'success'
        });
    });
});

/*get role by roleId*/
router.get('/search',function (req,res) {
    const roleId = req.query.roleId.replace(/[\'\"\\\/\b\f\n\r\t]/g, '');
    console.log(roleId);
    const sql = "SELECT * FROM role WHERE roleId='" + roleId + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (result == '') {
            res.send({
                status: 500,
                msg: 'Not found'
            })
        } else {
            res.send({
                status: 200,
                msg: 'success',
                data: result
            })
        }
    })
});

module.exports = router;
