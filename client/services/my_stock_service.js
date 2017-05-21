/* 
 * This is the code used to create stock service and register it to angular
 */

"use strict";

(function (angular) {
    angular.module("mainApp")
            .factory("myStockService", function ($resource) {
                return $resource("/api/stocks/:code/:socketID", null, {
                    get: {
                        method: "GET",
                        isArray: true
                    },
                    post: {
                        method: "POST"
                    },
                    delete: {
                        method: "DELETE"
                    }
                });
            });
})(window.angular);


