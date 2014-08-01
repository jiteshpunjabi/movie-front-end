/**
 * Created by jiteshvp on 1/8/14.
 */
angular.module('JMDB.authentication', [])
    .factory('AuthService', function ($q, $timeout, $window, $rootScope, $http, API_SERVER) {
        var userRoles = {
            public: 1, // 001
            user: 2, // 010
            admin: 4  // 100
        };
        var acl = {
            public: userRoles.public | // 7
                userRoles.user |
                userRoles.admin,
            user: userRoles.user | // 6
                userRoles.admin,
            admin: userRoles.admin //4
        };
        function setUser(username, role, token) {
                $window.localStorage.username = username;
                $window.localStorage.token = token;
                $window.localStorage.userRole = role;
                $rootScope.authentication = {
                username: username,
                token: token,
                role: role
                };
        }
        function unsetUser(username, role, token) {
                $window.localStorage.clear();
                $rootScope.authentication = {
                };
        }
        //#todo - refactor later
        function success_callback(data, status, headers, config, ret_defer) {

                        setUser(data.username, data.role, data.token);
                        ret_defer.resolve($rootScope.authentication);
        }
        function failure_callback(data, status, headers, config,ret_defer) {
                        unsetUser();
                        ret_defer.reject(data);
                    }
        return {
            isAllowed: function (level) {
                //fetch the role
                var role = $window.localStorage.getItem('userRole');
                if (role) {
                    //console.log('''inside isAllowed'+(acl[level] & userRoles[role]) === userRoles[role]);

                    return (acl[level] & userRoles[role]) === userRoles[role];
                }
                else return false;
            },
            getACL: function (level) {
                return acl;
            },
            isLoggedIn: function () {
                if ($window.localStorage.token != undefined)
                    return true;
                else {
                    //$window.localStorage.clear();
                    return false;
                }

            },
            login: function (username,password) {
                var ret = $q.defer();
                $http.post(API_SERVER + 'login/', 'username=' + username + '&password=' + password,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                ).success(function (data, status, headers, config) {

                        setUser(data.username, data.role, data.token);
                        ret.resolve($rootScope.authentication);
                    })
                    .error(function (data, status, headers, config) {
                        unsetUser();
                        ret.reject(data);
                    });
                return ret.promise;
            },
            register: function(username,password,email){
                var ret = $q.defer();
                $http.post(API_SERVER+'register/','username='+username+'&password='+password+'&mailid='+email,
                {
                    headers:{
                        'Content-Type':'application/x-www-form-urlencoded'
                    }
                }
            )
                .success(function (data, status, headers, config) {

                        setUser(data.username, data.role, data.token);
                        ret.resolve($rootScope.authentication);
                    })
                    .error(function (data, status, headers, config) {
                        unsetUser();
                        ret.reject(data);
                    });
                return ret.promise;
            },
            logout: function(){
                    var ret = $q.defer();
                    $http.post(API_SERVER+'logout/').success(function (data, status, headers, config) {
                        unsetUser();
                        ret.resolve(data);
                    }).error(function (data, status, headers, config) {
                        unsetUser();
                        ret.reject(data);
                    });
                return ret.promise;
        }

        };
    })

    .directive('accessLevel', ['$rootScope', 'AuthService', function ($rootScope, AuthService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch('authentication.role', function (role) {
                    if (!AuthService.isAllowed(attrs.accessLevel))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                });
            }
        };
    }])
    .run(['AuthService', '$rootScope', '$location', '$window', function (AuthService, $rootScope, $location, $window) {

        console.log('registering route change event');
        $rootScope.authentication = {
            username: $window.localStorage.username,
            token: $window.localStorage.token,
            role: $window.localStorage.userRole
        };
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            console.log(AuthService.isAllowed(next.access));
            if (!AuthService.isAllowed(next.access)) {
                if (AuthService.isLoggedIn()) $location.path('/movies');
                else {
                    $location.path('/login');
                }
            }
        });
    }]);
