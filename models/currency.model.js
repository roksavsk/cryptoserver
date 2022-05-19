const sql = require("./db");

const Currency = function(currency) {
  this.cryptoName = currency.cryptoName;
  this.coinbaseValue = currency.coinbaseValue;
  this.coinstatsValue = currency.coinstatsValue;
  this.coinmarketValue = currency.coinmarketValue;
  this.coinpaprikaValue = currency.coinpaprikaValue;
  this.kucoinValue = currency.kucoinValue;
  this.averagePrice = currency.averagePrice;
  this.date_time = currency.date_time;
};

Currency.create = (newCurrency, result) => {
  sql.query("INSERT INTO currencies SET ?", newCurrency, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created currency: ", { id: res.insertId, ...newCurrency });
    result(null, { id: res.insertId, ...newCurrency });
  });
};

Currency.createAll = (newCurrency) => {
  sql.query(`INSERT INTO currencies (cryptoName, coinbaseValue, coinstatsValue, coinmarketValue, coinpaprikaValue, kucoinValue, averagePrice) VALUES ?`, [newCurrency], (err, res) => {
    if (err) {
      console.log("error: ", err);
      return;
    }
    console.log("created currency: ", { id: res.insertId, ...newCurrency });
  });
};

Currency.findByName = (name, result) => {
  sql.query(`SELECT * FROM currencies WHERE cryptoName = '${name}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found currency: ", res);
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Currency.recent = result => {
  sql.query(`SELECT cryptoName, averagePrice FROM currencies ORDER BY id DESC LIMIT 20`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found currencies: ", res);
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Currency.getInfo = (name, market, date, result) => {
  sql.query(`SELECT cryptoName, ${market}, averagePrice, date_time FROM currencies WHERE cryptoName = '${name}' AND date_time LIKE '${date}%'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found currency: ", res);
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};


Currency.getAll = (cryptoName, result) => {
  let query = "SELECT * FROM currencies";
  if (cryptoName) {
    query += ` WHERE cryptoName LIKE '%${cryptoName}%'`;
  }
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("currencies: ", res);
    result(null, res);
  });
};

Currency.updateById = (id, currency, result) => {
  sql.query(
    "UPDATE currencies SET cryptoName = ?, coinbaseValue = ?, coinstatsValue = ?, coinmarketValue = ?, coinpaprikaValue = ?, kucoinValue = ?, averagePrice = ? WHERE id = ?",
    [currency.cryptoName, currency.coinbaseValue, currency.coinstatsValue, currency.coinmarketValue, currency.coinpaprikaValue, currency.kucoinValue, currency.averagePrice, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated currency: ", { id: id, ...currency });
      result(null, { id: id, ...currency });
    }
  );
};

Currency.remove = (id, result) => {
  sql.query("DELETE FROM currencies WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("deleted currency with id: ", id);
    result(null, res);
  });
};

Currency.removeAll = result => {
  sql.query("DELETE FROM currencies", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log(`deleted ${res.affectedRows} currencies`);
    result(null, res);
  });
};

module.exports = Currency;