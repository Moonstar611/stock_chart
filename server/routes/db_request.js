/* 
 * This is the code used by server to send request to database
 */
"use strict";

var Stocks = require("../db_model.js");
var mongoose = require('mongoose');
var https = require("https");
var queryUrl = "https://www.quandl.com/api/v3/datasets/WIKI/";

module.exports = function (app) {
//request database for recorded stocks and query api to get stocks data
    this.getStocksFromDB = function (req, res, next) {
        Stocks.find({}, function (err, stocks) {
            if (err) {
                throw err;
            }

            var ret = [];
            var count = 0;

            if (stocks.length == 0) {
                return res.json([]);
            }
            //get stocks on record from database
            stocks.forEach(function (stock) {
                var finalUrl = getFinalUrl(stock.code);
                retrieveStock(finalUrl).then(function (data) {
                    if (data.hasOwnProperty("quandl_error")) {
                        console.log("data.quandl_error");
                    } else {
                        ret.push(data);
                    }
                    count++;
                    if (count == stocks.length) {
                        res.json(ret);//send the data array to client
                    }


                });

            });


        });

    };

//stock newly added stocks to corresponded socketID
    this.storeStocksInDB = function (req, res, next) {
        //console.log("???????????????????:",req.body);
        var finalUrl = getFinalUrl(req.body.code);
        Stocks.findOne({"code": req.body.code}, function (err, result) {
            if (err) {
                throw err;
            }
            if (!result) {
                var newStock = new Stocks(req.body);
                retrieveStock(finalUrl).then(function (data) {
                    if (!data.hasOwnProperty("quandl_error")) {
                        newStock.save(function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    res.json(data);

                })
                        .catch(function (err) {
                            throw err;
                        });

            } else {
                return res.json({
                    stock_exists: "You already added this stock"});
            }

        });

    };

//remove stock
    this.removeStock = function (req, res, net) {
        Stocks.findOneAndUpdate({"code": req.params.code}, {"$set": {"socketID": req.params.socketID}}, function (err, stock) {
            if (err) {
                throw err;
            }
            if (stock) {
                Stocks.findOne({"code": req.params.code}, function (err, newstock) {
                    if (err) {
                        throw err;
                    }
                    newstock.remove();
                });
            }
        });

    };

    function retrieveStock(url) {
        return new Promise(function (resolve, reject) {
            https.get(url, function (res) {
                var data = "";
                res.on("data", function (chunk) {
                    data += chunk;
                });

                res.on("end", function () {
                    data = JSON.parse(data);
                    resolve(data);
                });

                res.on("error", function (err) {
                    throw err;
                });
            });

        });

    }

    function getFinalUrl(code) {
        var date = new Date();
        var endDate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
        var year = date.getFullYear() - 1;
        var startDate = year + "-" + date.getMonth() + "-" + date.getDate();
        var queryUrl = "https://www.quandl.com/api/v3/datasets/WIKI/";
        return queryUrl + code + ".json?api_key=vvsDHjAZgTmmisp2k2ZB&" + "start_date=" + startDate + "&end_date=" + endDate + "&order=asc&column_index=4";
    }
};


