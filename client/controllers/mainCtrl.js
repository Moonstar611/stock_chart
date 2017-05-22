
/*
 * This is the main controller control the front-end page angular and ui-router
 */

"Use strict";
function mainCtrl($scope, myStockService, mySocketService, $state) {
    $scope.stocks = [];
    var socket = io();
    //other client adds a stock
    socket.on("socket_save", function (data) { //data here is the complete stock data from api
        console.log("Other client is adding stock ", data);
        if (!data.hasOwnProperty("quandl_error")) {
            console.log("Pushing new stock into the stocks array");
            $scope.$apply(function () { //async call use $apply
                $scope.stocks.push(data);
            });

            console.log("now we have stocks: ", $scope.stocks);
            var seriesOptions = getSeriesOptions($scope.stocks);
            createChart(seriesOptions);
        }
    });

    //other client removes a stock
    socket.on("socket_remove", function (code) {//code here is the code of the stock data received from server
        console.log("Other client is removing stock: ", code);
        var index = findIndex(code, $scope.stocks);
        console.log("Removing stock with index: ", index);
        if (index != -1) {
            $scope.$apply(function () {
                $scope.stocks.splice(index, 1);
                var seriesOptions = getSeriesOptions($scope.stocks);
                createChart(seriesOptions);
            });
        }
    });

    //assign user id
    socket.on("socket_id", function (id) { //id here is the socket id assigned to the current user
        console.log("You've been assigned the user ID: ", id);
        mySocketService.setSocketID(id);
    });

    //get stocks from database (initialization)
    myStockService.get({}).$promise.then(function (response) { //response is an array of stocks data from server
        $scope.stocks = [];
        var count = 0;
        console.log(response); //debugger
        if (response.length == 0) { //no tracking stocks, plot an empty graph
            createChart([]);
        }
        response.forEach(function (data) {
            console.log("Get data: ", data);
            if (data.hasOwnProperty("quandl_error")) {
                console.log(data.quandl_error);
            } else {
                $scope.stocks.push(data);
            }
            count++;
            if (count === response.length) {
                var seriesOptions = getSeriesOptions($scope.stocks);
                createChart(seriesOptions);
            }
        });
    }).catch(function (err) {
        throw err;
    });

    //buttons' functions
    $scope.addStock = function () {
        if (!window.angular.isDefined($scope.stockCode) || $scope.stockCode.length == 0) {
            $scope.showErr = true;
            $scope.errInfo = "Please enter a stock code";
            
            console.log("stock code undefined");
            return;
        }
        $scope.showErr = false;
        myStockService.post({}, {
            code: $scope.stockCode.toUpperCase(),
            socketID: mySocketService.getSocketID()
        }).$promise
                .then(function (data) { //the just-added stock data from server
                    if (data.hasOwnProperty("stock_exists")) {
                        $scope.showErr = true;
                        $scope.errInfo = data.stock_exists;
                        return;
                    }else if(data.hasOwnProperty("quandl_error")){
                        $scope.showErr = true;
                        if(data.quandl_error.message=="You have submitted an incorrect Quandl code. Please check your Quandl codes and try again."){
                            $scope.errInfo = "This Code Does Not Match Any Stock";
                            return;
                        }
                        $scope.errInfo = data.err;
                        return;
                    }
                    console.log("The data of the just-added stock is received from server: ", data);
                    $scope.stocks.push(data);
                    var seriesOptions = getSeriesOptions($scope.stocks);
                    console.log("The new series options: ", seriesOptions);
                    createChart(seriesOptions);
                });
    };

    $scope.removeStock = function (index) {
        var stock_code = $scope.stocks[index].dataset.dataset_code;
        $scope.stocks.splice(index, 1);
        var seriesOptions = getSeriesOptions($scope.stocks);
        console.log("This stock is removed (index): ", index);
        createChart(seriesOptions);
        myStockService.delete({
            code: stock_code,
            socketID: mySocketService.getSocketID()
        });
    };


    //find the stock's index in the stock array by its code
    function findIndex(code, stocks) { //code is the stock's code and stocks is the scope array of all the stocks
        var index = -1;
        for (var i = 0; i < stocks.length; i++) {
            if (stocks[i].dataset.dataset_code == code) {
                index = i;
                return index;
            }
        }
        return index;
    }

    //create seriesOptions for charting from the stocks array;
    function getSeriesOptions(stocks) { //stocks is the scope array of stocks
        var s_o = []; //seriesOptions for charting
        stocks.forEach(function (stock) { //single element of stocks array
            s_o.push({
                name: stock.dataset.dataset_code,
                data: trimData(stock.dataset.data)
            });

        });
        return s_o;
    }

    //process the data of a single stock
    function trimData(data) {
        var dt = [];
        data.forEach(function (item) {
            dt.push([new Date(item[0]).getTime(), item[1]]);
        });
        return dt;
    }

    //style the chart
    Highcharts.theme = {
        colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
            backgroundColor: "#000000",
            style: {
                fontFamily: "'Droid Sans', sans-serif"
            },
            plotBorderColor: "#606063"
        },
        title: {
            style: {
                color: "#E0E0E3",
                textTransform: "uppercase",
                fontSize: "32px"
            }
        },
        subtitle: {
            style: {
                color: "#E0E0E3",
                textTransform: "uppercase"
            }
        },
        xAxis: {
            gridLineColor: "#707073",
            labels: {
                style: {
                    color: "#E0E0E3",
                    textTransform: "uppercase"
                }
            },
            lineColor: "#707073",
            minorGridLineColor: "#505053",
            tickColor: "#707073",
            title: {
                style: {
                    color: "#A0A0A3"
                }
            }
        },
        yAxis: {
            gridLineColor: "#707073",
            labels: {
                style: {
                    color: "white"
                }
            },
            lineColor: "#707073",
            minorGridLineColor: "#505053",
            tickColor: "#707073",
            tickWidth: 1,
            title: {
                style: {
                    color: "#A0A0A3"
                }
            }
        },
        tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            style: {
                color: "#F0F0F0"
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    color: "#B0B0B3"
                },
                marker: {
                    lineColor: "#333"
                }
            },
            boxplot: {
                fillColor: "#505053"
            },
            candlestick: {
                lineColor: "white"
            },
            errorbar: {
                color: "white"
            }
        },
        legend: {
            itemStyle: {
                color: "#E0E0E3"
            },
            itemHoverStyle: {
                color: "#FFF"
            },
            itemHiddenStyle: {
                color: "#606063"
            }
        },
        credits: {
            style: {
                color: "#666"
            }
        },
        labels: {
            style: {
                color: "#707073"
            }
        },
        drilldown: {
            activeAxisLabelStyle: {
                color: "#F0F0F3"
            },
            activeDataLabelStyle: {
                color: "#F0F0F3"
            }
        },
        navigation: {
            buttonOptions: {
                symbolStroke: "#DDDDDD",
                theme: {
                    fill: "#505053"
                }
            }
        },
        rangeSelector: {
            buttonTheme: {
                fill: "#505053",
                stroke: "#000000",
                style: {
                    color: "#CCC"
                },
                states: {
                    hover: {
                        fill: "#707073",
                        stroke: "#000000",
                        style: {
                            color: "white"
                        }
                    },
                    select: {
                        fill: "#000003",
                        stroke: "#000000",
                        style: {
                            color: "white"
                        }
                    }
                }
            },
            inputBoxBorderColor: "#505053",
            inputStyle: {
                backgroundColor: "#333",
                color: "silver"
            },
            labelStyle: {
                color: "silver"
            }
        },
        navigator: {
            handles: {
                backgroundColor: "#666",
                borderColor: "#AAA"
            },
            outlineColor: "#CCC",
            maskFill: "rgba(255,255,255,0.1)",
            series: {
                color: "#7798BF",
                lineColor: "#A6C7ED"
            },
            xAxis: {
                gridLineColor: "#505053"
            }
        },
        scrollbar: {
            barBackgroundColor: "#808083",
            barBorderColor: "#808083",
            buttonArrowColor: "#CCC",
            buttonBackgroundColor: "#606063",
            buttonBorderColor: "#606063",
            rifleColor: "#FFF",
            trackBackgroundColor: "#404043",
            trackBorderColor: "#404043"
        },
        legendBackgroundColor: "rgba(0, 0, 0, 0.5)",
        background2: "#505053",
        dataLabelsColor: "#B0B0B3",
        textColor: "#C0C0C0",
        contrastTextColor: "#F0F0F3",
        maskColor: "rgba(255,255,255,0.3)"
    };
    var highchartsOptions = Highcharts.setOptions(Highcharts.theme);

    //chart the stocks
    function createChart(seriesOptions) {

        Highcharts.stockChart('stock_chart', {
            title: {
                align: "center",
                text: "STOCKS"

            },
            rangeSelector: {
                selected: 1
            },

            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                        value: 0,
                        width: 2,
                        color: 'silver'
                    }]
            },

            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },

            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
            credits: false,

            series: seriesOptions
        });
    }
}











	