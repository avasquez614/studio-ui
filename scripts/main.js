(function (angular) {
    'use strict';

    var app = angular.module('userDashboard', [
        'ui.router',
        'ui.bootstrap'
    ]);

    app.config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider
                .otherwise('/');

            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'templates/home',
                    controller: 'SitesCtrl'
                })
                .state('home.site', {
                    url: 'site/:siteId',
                    templateUrl: 'templates/site',
                    controller: 'SiteCtrl'
                })
                .state('settings', {
                    url: '/settings',
                    templateUrl: 'templates/settings',
                    controller: 'AppCtrl'
                })
                .state('login', {
                    url: '/login',
                    onEnter: [
                        '$rootScope', '$state', '$modal',
                        function ($rootScope, $state, $modal) {

                            $rootScope.loginModal = $modal.open({
                                templateUrl: 'templates/login',
                                controller: 'LoginCtrl',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'sm'
                            });

                            $rootScope.loginModal.result.finally(function () {
                                $rootScope.loginModal = null;
                                $state.go('home');
                            });

                        }
                    ],
                    onExit: [
                        '$rootScope',
                        function ($rootScope) {
                            if ($rootScope.loginModal) {
                                $rootScope.loginModal.close();
                            }
                        }
                    ]
                })
                .state('login.recover', {
                    url: '/recover',
                    onEnter: [
                        '$rootScope', '$state', '$modal',
                        function ($rootScope, $state, $modal) {

                            $rootScope.recoverModal = $modal.open({
                                templateUrl: 'templates/login/recover',
                                controller: 'RecoverCtrl',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'sm'
                            });

                            $rootScope.recoverModal.result.finally(function () {
                                $rootScope.recoverModal = null;
                                $state.go('login');
                            });

                        }
                    ],
                    onExit: [
                        '$rootScope',
                        function ($rootScope) {
                            if ($rootScope.recoverModal) {
                                $rootScope.recoverModal.close();
                            }
                        }
                    ]
                });

        }
    ]);

    app.run([
        '$rootScope', '$state', '$stateParams', 'authService',
        function ($rootScope, $state, $stateParams, authService) {

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeStart', function (event, toState) {

                if (toState.name.indexOf('login') === -1 && !authService.isAuthenticated()) {
                    event.preventDefault();
                    $state.go('login');
                }

            });

        }
    ]);

    app.constant('Constants', {
        AUTH_SUCCESS: 'auth-success',
        SERVICE: '/studio/api/1/services/api/1/user/'
    });

    app.service('authService', [
        '$rootScope', '$http', '$document', 'Constants',
        function ($rootScope, $http, $document, Constants) {

            var user = null;
            var script = $document[0].getElementById('user');

            if (script) {
                script = angular.element(script);
                user = JSON.parse(script.html());
            }

            this.isAuthenticated = function() {
                return !!user;
            };

            this.login = function (data) {
                return $http({
                    data: data,
                    method: 'POST',
                    url: api('login'),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    }
                }).then(function (data) {
                        if (data.data.type === 'success') {

                            user = data.data.user;
                            $rootScope.$broadcast(Constants.AUTH_SUCCESS, user);

                        }
                        return data.data;
                    });
            };

            this.logout = function () {
                user = null;
            };

            this.getUser = function () {
                return user;
            };

            this.recoverPassword = function (data) {
                return $http.post(api('reset-password'), data);
            };

            this.changePassword = function (data) {
                return $http.post(api('change-password'), data)
                    .then(function (data) {
                        return data.data;
                    });
            };

            function api(action) {
                return Constants.SERVICE + action + '.json';
            }

            return this;

        }
    ]);

    app.service('sitesService', [
        '$http', 'Constants',
        function ($http, Constants) {

            this.getSites = function() {
                return $http.get(json('get-sites-2'));
            };

            this.getSite = function(id) {
                return $http.get(json('get-site'), {
                    params: { siteId: id }
                });
            };

            function json(action) {
                return Constants.SERVICE + action + '.json';
            }

            return this;

        }
    ]);

    app.controller('AppCtrl', [
        '$scope', '$state', 'authService', 'Constants',
        function ($scope, $state, authService, Constants) {

            function logout() {
                authService.logout();
                $state.go('login');
            }

            function changePassword() {
                authService.changePassword($scope.data)
                    .then(function (data) {
                        $scope.error = $scope.message = null;
                        if (data.type === 'error') {
                            $scope.error = data.message;
                        } else if (data.error) {
                            $scope.error = data.error;
                        } else {
                            $scope.message = data.message;
                        }
                    });
            }

            $scope.user = authService.getUser();
            $scope.data = { email: ($scope.user || { 'email': '' }).email };
            $scope.error = null;

            $scope.logout = logout;
            $scope.changePassword = changePassword;

            $scope.$on(Constants.AUTH_SUCCESS, function ($event, user) {

                $scope.user = user;
                $scope.data.email = $scope.user.email;
                $scope.text = typeof user;

                console.log($scope.user);

            });

        }
    ]);

    app.controller('SitesCtrl', [
        '$scope', '$state', 'sitesService',
        function ($scope, $state, sitesService) {

            $scope.sites = null;

            function getSites () {
                sitesService.getSites()
                    .success(function (data) {
                        $scope.sites = data;
                    })
                    .error(function () {
                        $scope.sites = null;
                    });
            }

            getSites();

        }
    ]);

    app.controller('SiteCtrl', [
        '$scope', '$state',
        function ($scope, $state) {

            function select($event) {
                $event.target.select();
            }

            function percent(data) {
                return Math.ceil((data.used * 100) / (data.total));
            }

            function getSite() {

                var siteId = $state.params.siteId;

                if (!$scope.sites) {
                    return;
                }

                for (var i = 0,
                         sites = $scope.sites,
                         site = sites[i],
                         l = sites.length;
                     i < l;
                     site = sites[++i]) {
                    if ((site.id+'') === (siteId+'')) {
                        $scope.site = site;
                        break;
                    }
                }

            }

            $scope.site = null;

            $scope.percent = percent;
            $scope.select = select;

            $scope.$watch('sites', function () {
                getSite();
            });

        }
    ]);

    app.controller('LoginCtrl', [
        '$scope', '$state', 'authService', '$timeout',
        function ($scope, $state, authService, $timeout) {

            var credentials = {};

            function login() {

                authService.login(credentials)
                    .then(function (data) {
                        if (data.type === 'error') {
                            $scope.error = data;
                        }  else if (data.error) {
                            $scope.error = data.error;
                        } else {
                            $state.go('home');
                        }
                    });

            }

            function getModalEl() {
                return document.getElementById('loginView').parentNode.parentNode.parentNode;
            }

            function showModal() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).addClass('in');
            }

            function hideModal() {
                var loginViewEl = getModalEl();
                angular.element(loginViewEl).removeClass('in');
            }

            $scope.error = null;
            $scope.credentials = credentials;

            $scope.login = login;

            $scope.$on('$stateChangeSuccess', function() {
                if ($state.current.name === 'login') {
                    showModal();
                } else if ($state.current.name === 'login.recover') {
                    hideModal();
                }
            });

            $scope.$on('$viewContentLoaded', function() {
                if ($state.current.name === 'login.recover') {
                    $timeout(hideModal, 50);
                }
            });

        }
    ]);

    app.controller('RecoverCtrl', [
        '$scope', '$state', 'authService',
        function ($scope, $state, authService) {

            var credentials = $scope.credentials = {};

            $scope.recover = function recover() {
                authService.recoverPassword(credentials)
                    .success(function (data) {
                        if (data.type === 'error') {
                            $scope.error = data.message;
                        }  else if (data.error) {
                            $scope.error = data.error;
                        } else {
                            $scope.success = data.message;
                        }
                    });
            };

        }
    ]);

})(angular);