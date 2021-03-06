const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB
});

connection.connect(err => {
  if (err) throw error;
  console.log("Database connection established");
});

let sql = "CREATE TABLE IF NOT EXISTS currencies (id INT AUTO_INCREMENT PRIMARY KEY, cryptoName VARCHAR(50), coinbaseValue VARCHAR(50), coinstatsValue VARCHAR(50), coinmarketValue VARCHAR(50), coinpaprikaValue VARCHAR(50), kucoinValue VARCHAR(50), averagePrice VARCHAR(50), date_time DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8;";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});

module.exports = connection;