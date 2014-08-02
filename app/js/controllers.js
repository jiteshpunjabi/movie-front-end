'use strict';

/* Controllers */

angular.module('JMDB.controllers', [])
    .controller('MyCtrl1', ['$scope', 'Movie', '$location', 'ShareMovie', function ($scope, Movie, $location, ShareMovie) {
        //helper function to reset pagination data
        var reset_data = function () {
            $scope.movies = [];
            $scope.meta = {
                page: 0,
                total_pages: 0
            };
        };
        //for holding pagination and other metadata from responses
        $scope.meta = {};
        //pagination control -> next page
        $scope.nextPagePath = function () {
            $location.search('page', $scope.meta.page + 1);
        };
        //pagination control -> previous page
        $scope.previousPagePath = function () {
            $location.search('page', $scope.meta.page - 1);
        };
        //event fired on partial load...process the query and load data from the resource service
        $scope.$on('$routeChangeSuccess', function () {
            var q = $location.search();
            if (q.query && q.field) {
                Movie.search({query: q.query.replace(' ', '+'), field: q.field, page_no: q.page}, function (resource) {
                    $scope.movies = resource.data;
                    $scope.meta = resource.metadata;
                }, function (resource) {
                    alert(resource.data.status + resource.data.message);
                    reset_data();
                });
            }
            else {
                var d = parseInt($location.search().page);
                Movie.getPage({page_no: d ? d : 1 }, function (resource) {
                    $scope.movies = resource.data;
                    $scope.meta = resource.metadata;
                }, function (resource) {
                    alert(resource.data.status + resource.data.message);
                    reset_data();
                });
            }
        });
        //pass the movie to share movie service so that it is accessible to the following page
        $scope.share = function (movie) {
            ShareMovie.addMovie(movie);
        };
        //delete call for the resource
        $scope.delete=function(pk){
            var id=parseInt(pk);
            if (id)
                Movie.delete({id:id}, function(resource){
                    alert('delete successful');
                },function(resource){
                    alert('delete failed');
                });
        };
    }])
    // controller for the login and registration form
    .controller('LoginController', ['$scope','$http', 'API_SERVER','$window', '$location','AuthService',function ($scope,$http, API_SERVER,$window, $location, AuthService) {
        $scope.alertBanner = false;
        var success = function(authentication){
            $scope.alertBanner=false;
            $location.path('movies');
        };
        var failure = function(error){
            $scope.alertBanner = "error logging in! "+error.status+":"+error.message;
        };
        $scope.signIn = function(){
            if($scope.username && $scope.password){
                AuthService.login($scope.username,$scope.password).then(success,failure);
            }
        };
        $scope.register =  function(){
            if($scope.username && $scope.password && $scope.email){
                AuthService.register($scope.username,$scope.password).then(success,failure);
            }
        }
    }])
    //controller to handle the search form
    .controller('index-controller', ['$scope', '$location', '$http','API_SERVER','$window','AuthService', function ($scope, $location, $http, API_SERVER,$window,AuthService) {
        $scope.field = "name";
        $scope.search = function (page) {
            var temp = $scope.query_string;
            $location.search('query', temp);
            $location.search('field', $scope.field);
            $location.search('page', 1);
            $location.path(page);
        };
        function logout_success(){
            $location.path('/login');
        }
        $scope.logout = function(){
            AuthService.logout().then(logout_success,logout_success)
        };
            /*function(){
            $http.post(API_SERVER+'logout/').success(logout_success).error(logout_success)
        }*/

    }])
    .controller('EditController', ['$scope', 'ShareMovie', '$location', 'Movie', function ($scope, ShareMovie, $location, Movie) {

        $scope.alertBanner = false;
        $scope.successBanner = false;
        $scope.$on('$routeChangeSuccess', function () {
            var movie = ShareMovie.getMovie();
            if(movie) {
                $scope.movie = movie;
                $scope.genre = $scope.movie.genre.join();
            }
            if (!$scope.movie && $location.search().id) {
                Movie.get({id: $location.search().id}, function (resource) {
                    $scope.movie = resource;
                    $scope.genre = $scope.movie.genre.join()
                });
            }


        });
            $scope.mode =$location.search().id == undefined ? "Add " : "Edit ";

                $scope.submit = function () {
                    $scope.movie.genre= $scope.genre.split(",");
                    if ($location.search().id === undefined) {
                        $scope.mode = "Add ";
                        Movie.create({},$scope.movie, function (resource) {
                            //handle the success
                            $scope.successBanner = "Successful! Yea";
                            $scope.alertBanner = false;
                        }, function (resource) {
                            $scope.alertBanner = resource.error.message;
                            $scope.successBanner = false
                        })
                    }
                    else {
                        $scope.submit = function () {
                            Movie.update({id: $scope.movie.pk},$scope.movie, function (resource) {
                                //handle the success
                                $scope.successBanner = "Successful! Yea";
                                $scope.alertBanner = false;
                            }, function (resource) {
                                $scope.alertBanner = resource.error.message;
                                $scope.successBanner = false
                            });
                        };
                    }
                };

    }]);
