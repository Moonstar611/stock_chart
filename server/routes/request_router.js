/* 
 * dealing with the request received from client
 */
"use strict";
var databaseRequest = require("./db_request.js");

module.exports = function(app){
	var dbRouter = new databaseRequest(app);
	app.get("/api/stocks", dbRouter.getStocksFromDB);
	app.post("/api/stocks", dbRouter.storeStocksInDB);
	app.delete("/api/stocks/:code/:socketID", dbRouter.removeStock);
};

