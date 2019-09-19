const express = require('express')
const router = express.Router()
const connection = require('../db/DBConfig')

router.get('/part',function(req,res){
    const sql = 'SELECT * FROM trainNote-part'
    connection(sql, function (err, result) {
        if (err) {
            console.log('[SELECT ERROR]:', err.message);
        }
        res.send({
            status: 200,
            data: result,
            msg: 'success'
        });
    });
})

module.exports = router;