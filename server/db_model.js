/* 
 * Defines the database model
 */
"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var stockSchema = new Schema({
    code: String,
    socketID: String
});

//console.log(stockSchema);
//var model = mongoose.model("stock", stockSchema);
//console.log(model.schema);

module.exports = mongoose.model("Stock", stockSchema);



