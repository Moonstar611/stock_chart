/* 
 * This is the code used to create socket service and register it to angular
 */

"use strict";

(function (angular) {
    angular.module("mainApp").factory("mySocketService", function () {
        var socketID = undefined;

        return{
            setSocketID: function (id) {
//server will send this id to client as in mainCtrl's function socket.on("socket_id")
                socketID = id;
                console.log("socket id: " + socketID + " is set to this page successfully");
            },

            getSocketID: function () {
                return socketID;
            }
        };
    });
})(window.angular);

