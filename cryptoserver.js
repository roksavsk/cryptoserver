const express = require("express");

const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const axios = require("axios");
const Currency = require("./models/currency.model");
const cron = require("node-cron");
require("dotenv").config();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to Cryptocurrency commutator!")
});

require("./routes/currency.routes.js")(app);
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});

app.get("/coins", async (req, res) => {
  const topcoins = await getCoins();
  res.send(topcoins);
});

let coinbase1, coinmarket1, coinstats1, coinpaprika1, kucoin1;

async function getCoins() {

  await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=USD")
  .then(response => {
      coinbase1 = response.data["data"]["rates"];
      console.log("Coinbase data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", {
      headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKET_API_KEY,
      }
  })
  .then(response => {
      coinmarket1 = response.data["data"];
      console.log("Coinmarket data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios
  .get("https://api.coinstats.app/public/v1/coins?skip=0&limit=0&currency=USD")
  .then(response => {
      coinstats1 = response.data["coins"];
      console.log("Coinstats data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios
  .get("https://api.coinpaprika.com/v1/tickers")
  .then(response => {
      coinpaprika1 = response.data;
      console.log("Coinpaprika data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });

  await axios
  .get("https://api.kucoin.com/api/v1/prices")
  .then(response => {
      kucoin1 = response.data["data"];
      console.log("Kucoin data is saved.");
  })
  .catch(error => {
      console.log("error", error);
  });
  
  let common;
  const intersect = (a1, a2, ...rest) => {
    const a12 = a1.filter(value => a2.includes(value))
    if (rest.length === 0) { return a12; }
    return intersect(a12, ...rest);
  };
  
  function existInAllFiles() {
    let coins1 = [coinstats1, coinmarket1, coinpaprika1];
    let coins2 = [coinbase1, kucoin1];
    let j = 0;
    let existAll = [[], [], [], [], []];
    coins1.forEach(item => {
      for (let i=0; i < item.length; i++) {
        existAll[j].push(item[i]["symbol"]);
      };
      j++;
    });
    coins2.forEach(item => {
      for (let i=0; i < Object.keys(item).length; i++) {
        existAll[j].push(Object.keys(item)[i]);
      };
      j++;
    });
    common = intersect(...existAll);
    console.log(`Всего валют: ${common.length}`);
    return common;
  };
  // existInAllFiles();
  console.log(existInAllFiles());

  i = common.indexOf("XRP");
  if(i >= 0) {
    common.splice(i,1);
  }
  topcoins = common.slice(0, 20);
  
  console.log(topcoins);
  return topcoins;
};

async function getApi(){

  const topcoins = await getCoins();
  
  let coinbase = new Object();

  for (element of topcoins){
    await axios
    .get(`https://api.coinbase.com/v2/prices/${element}-USD/buy`)
    .then(response => {
      let res = response.data;
      coinbase[element] = res.data.amount;
    })
    .catch(error => {
        console.log("error", error);
    })
  };

  let coinstats = new Object();
  let coinmarket = new Object();
  let coinpaprika = new Object();
  let kucoin = new Object();
  
  function getPrice() {
    for (let i=0; i < Object.keys(kucoin1).length; i++) {
      for (let currency of topcoins) {
        if (currency == Object.entries(kucoin1)[i][0]) {
          kucoin[currency] = Object.entries(kucoin1)[i][1];
        };
      };
    };
  
    for (let i=0; i < coinstats1.length; i++) {
      for (let currency of topcoins) {
        if (currency == coinstats1[i]["symbol"]) {
          coinstats[currency] = coinstats1[i]["price"];
        };
      };
    };
    for (let i=0; i < coinpaprika1.length; i++) {
      for (let currency of topcoins) {
        if (currency == coinpaprika1[i]["symbol"]) {
          coinpaprika[currency] = coinpaprika1[i]["quotes"]["USD"]["price"];
        };
      };
    };
  
    for (let i=0; i < coinmarket1.length; i++) {
      for (let currency of topcoins) {
        if (currency == coinmarket1[i]["symbol"]) {
          coinmarket[currency] = coinmarket1[i]["quote"]["USD"]["price"];
        };
      };
    };
    
    const sortObject = obj => Object.keys(obj).sort().reduce((res, key) => (res[key] = obj[key], res), {});
    coinbase = sortObject(coinbase);
    coinstats = sortObject(coinstats);
    coinmarket = sortObject(coinmarket);
    coinpaprika = sortObject(coinpaprika);
    kucoin = sortObject(kucoin);

    let arr = Object.entries(coinbase);
    for (let i=0; i < Object.entries(coinbase).length; i++){
      arr[i].push(Object.values(coinstats)[i]);
      arr[i].push(Object.values(coinmarket)[i]);
      arr[i].push(Object.values(coinpaprika)[i]);
      arr[i].push(Object.values(kucoin)[i]);
      arr[i].push(((Number(arr[i][1]) + arr[i][2] + arr[i][3] + arr[i][4] + Number(arr[i][5]))/5).toFixed(2));
    };

    Currency.createAll(arr);
    
  };
  getPrice();
};


let cronjob = cron.schedule("*/5 * * * *", () => {
  console.log("Running server every 5 minute");
  getApi();
});

cronjob.start();