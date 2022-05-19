const Currency = require("../models/currency.model");

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  const currency = new Currency({
    cryptoName: req.body.cryptoName,
    coinbaseValue: req.body.coinbaseValue,
    coinstatsValue: req.body.coinstatsValue,
    coinmarketValue: req.body.coinmarketValue,
    coinpaprikaValue: req.body.coinpaprikaValue,
    kucoinValue: req.body.kucoinValue,
    averagePrice: req.body.averagePrice,
  });
  Currency.create(currency, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Currency."
      });
    else res.send(data);
  });
};

exports.findAll = (req, res) => {
  const title = req.query.cryptoName;
  Currency.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving currencies."
      });
    else res.send(data);
  });
};

exports.findOne = (req, res) => {
  Currency.findByName(req.params.name, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Currency with name ${req.params.name}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Currency with name " + req.params.name
        });
      }
    } else res.send(data);
  });
};

exports.recent = (req, res) => {
  Currency.recent((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving currencies."
      });
    else res.send(data);
  });
};


exports.getInfo = (req, res) => {
  Currency.getInfo(req.params.name, req.params.market, req.params.date, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Currency with name ${req.params.name}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Currency with name " + req.params.name
        });
      }
    } else res.send(data);
  });
};

exports.update = (req, res) => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
    console.log(req.body);
    Currency.updateById(
      req.params.id,
      new Currency(req.body),
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Currency with id ${req.params.id}.`
            });
          } else {
            res.status(500).send({
              message: "Error updating Currency with id " + req.params.id
            });
          }
        } else res.send(data);
      }
    );
};

exports.delete = (req, res) => {
    Currency.remove(req.params.id, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Currency with id ${req.params.id}.`
          });
        } else {
          res.status(500).send({
            message: "Could not delete Currency with id " + req.params.id
          });
        }
      } else res.send({ message: `Currency was deleted successfully!` });
    });
};

exports.deleteAll = (req, res) => {
    Currency.removeAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all currencies."
        });
      else res.send({ message: `All Currencies were deleted successfully!` });
    });
};