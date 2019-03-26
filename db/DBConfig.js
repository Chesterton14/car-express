//MySQL数据库配置
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3307',
    user: 'root',
    password: 'root',
    database: 'test'
});
module.exports = connection;



