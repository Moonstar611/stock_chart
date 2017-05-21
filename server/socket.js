/* 
 * Socket io push new data to other users, after a user add a new stock, the listener was deployed on database.
 */
"use strict";

var Stocks = require("./db_model.js");
var https = require("https");

module.exports = function (app, io) {
    io.on("connection", function (socket) {
        console.log("New user is connected: " + socket.id);
        socket.emit("socket_id", socket.id); //send socket id to user
        socket.on("disconnect", function () {
            console.log("Customer is disconnected");
        });
    });

    //add listeners to database
    
    var events = ["save", "remove"];

    events.forEach(function (event) {
        if (event == "remove") {
            Stocks.schema.post("remove", function (doc) {
                console.log("Removing doc: ", doc);
                io.sockets.connected[doc.socketID].broadcast.emit("socket_remove", doc.code);

            });
            return;
        }
        Stocks.schema.post(event, function (doc) {
            console.log("Some one has saved a new stock: ", doc);
            var promise = new Promise(function (resolve, reject) {
                https.get(getFinalUrl(doc.code), function (res) {
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
            promise.then(function (data) {
                console.log("Broadcasting the new stock to other user.");
                //broadcast to users except the one that just add stock
                io.sockets.connected[doc.socketID].broadcast.emit("socket_" + event, data);

            });
        });
    });
    

    function getFinalUrl(code) {
        var date = new Date();
        var endDate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
        var year = date.getFullYear() - 1;
        var startDate = year + "-" + date.getMonth() + "-" + date.getDate();
        var queryUrl = "https://www.quandl.com/api/v3/datasets/WIKI/";
        return queryUrl + code + ".json?api_key=vvsDHjAZgTmmisp2k2ZB&" + "start_date=" + startDate + "&end_date=" + endDate + "&order=asc&column_index=4";
    }


};

