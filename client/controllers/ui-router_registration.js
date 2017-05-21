/*
 * Register the uirouter to mainApp, add template file "ui-router.html" and controller "mainCtrl" to ui-router
 */
"use strict";

(function(angular){
    angular.module("mainApp").config(["$stateProvider","$urlRouterProvider",function($stateProvider, $urlRouterProvider){
            $stateProvider.state("home", {
                url : "/", 
                templateUrl : "/s_c/ui-router.html", 
                controller : mainCtrl
            });
            $urlRouterProvider.otherwise("/");
    }]);
})(window.angular);

