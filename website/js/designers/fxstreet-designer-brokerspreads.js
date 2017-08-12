﻿(function () {
    FXStreetDesigners.Class.BrokerSpreads = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.directive('ngEnter',
                function() {
                    return function(scope, element, attrs) {
                        element.bind("keydown keypress",
                            function(event) {
                                if (event.which === 13) {
                                    scope.$apply(function() {
                                        scope.$eval(attrs.ngEnter);
                                    });

                                    event.preventDefault();
                                }
                            });
                    };
                });

            designerModule.controller('SimpleCtrl',
            [
                '$scope', '$q', '$log', '$http', 'propertyService',
                function($scope, $q, $log, $http, propertyService) {

                    propertyService.get()
                        .then(function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);
                                }
                            },
                            function(data) {
                                $scope.feedback.showError = true;
                                if (data) {
                                    $scope.feedback.errorMessage = data.Detail;
                                }
                            })
                        .finally(function() {
                            $scope.feedback.showLoadingIndicator = false;

                            var getError = function() {
                                $log.error('Error getting data');
                            }
                            var getBrokers = function() {
                                var apiUrl = '/api/brokerapi/getitems?culturename=en&page=1&take=1000';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }
                            var getPairs = function() {
                                var apiUrl = '/api/assetapi/getassets?culturename=en';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }

                            $q.all([
                                getBrokers(),
                                getPairs()
                            ]).then(
                                function(arrayResponse) {
                                    $scope.Brokers = arrayResponse[0].data;
                                    $scope.Pairs = arrayResponse[1].data.Result;
                                });

                            $scope.showAllSpreadsButton = $
                                .parseJSON($scope.properties.ShowAllSpreadsButton.PropertyValue.toLowerCase());

                            $scope.SetShowAllSpreadsButton = function() {
                                $scope.properties.ShowAllSpreadsButton.PropertyValue = JSON
                                    .stringify($scope.showAllSpreadsButton);
                            }

                            $scope.Take = ($scope.properties.Take.PropertyValue);
                            $scope.BrokerIds = $.parseJSON($scope.properties.BrokerIds.PropertyValue) || [];
                            $scope.PairIds = $.parseJSON($scope.properties.PairIds.PropertyValue) || [];

                            var updateBrokers = function() {
                                $scope.properties.BrokerIds.PropertyValue = JSON.stringify($scope.BrokerIds);
                            }
                            var updatePairs = function() {
                                $scope.properties.PairIds.PropertyValue = JSON.stringify($scope.PairIds);
                            }
                            $scope.GetBrokersSelected = function() {
                                var result = [];
                                if ($scope.Brokers && $scope.BrokerIds) {
                                    result = $.grep($scope.Brokers,
                                        function(item) {
                                            return !!$scope.BrokerIds.findFirst(function(i) { return i === item.Id });
                                        });
                                }
                                return result;
                            }
                            $scope.AddBroker = function() {
                                var broker = $scope.brokerSelected;
                                if (broker) {
                                    var index = $scope.BrokerIds.indexOf(broker.Id);
                                    var exist = $scope.Brokers.indexOf(broker);
                                    if (index === -1 && exist !== -1) {
                                        $scope.BrokerIds.push(broker.Id);
                                        updateBrokers();
                                    }
                                    $scope.brokerSelected = null;
                                };
                            };
                            $scope.RemoveBroker = function(broker) {
                                var index = $scope.BrokerIds.indexOf(broker.Id);
                                if (index > -1) {
                                    $scope.BrokerIds.splice(index, 1);
                                    updateBrokers();
                                }
                            }

                            $scope.GetPairsSelected = function() {
                                var result = [];
                                if ($scope.Pairs && $scope.PairIds) {
                                    result = $.grep($scope.Pairs,
                                        function(item) {
                                            return $scope.PairIds.findFirst(function(i) { return i === item.Id });
                                        });
                                }
                                return result;
                            }
                            $scope.AddPair = function() {
                                var pair = $scope.pairSelected;
                                if (pair) {
                                    var index = $scope.PairIds.indexOf(pair.Id);
                                    var exist = $scope.Pairs.indexOf(pair);
                                    if (index === -1 && exist !== -1) {
                                        $scope.PairIds.push(pair.Id);
                                        updatePairs();
                                    }
                                    $scope.pairSelected = null;
                                };
                            };
                            $scope.RemovePair = function(pair) {
                                var index = $scope.PairIds.indexOf(pair.Id);
                                if (index > -1) {
                                    $scope.PairIds.splice(index, 1);
                                    updatePairs();
                                }
                            }
                        });
                }
            ]);
        }

        return _this;
    }
}());