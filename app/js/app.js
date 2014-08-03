'use strict';


// Declare app level module which depends on filters, and services
angular.module('JMDB', [
  'ngRoute',
  'JMDB.filters',
  'JMDB.services',
  'JMDB.directives',
  'JMDB.controllers',
  'JMDB.authentication'
]).
config(['$routeProvider', '$httpProvider',function($routeProvider,$httpProvider) {

  $httpProvider.interceptors.push('AuthInterceptor');
  //$routeProvider.when('/', {templateUrl: 'partials/movie_list.html', controller: 'MyCtrl1', access:'user'});
  $routeProvider.when('/movies', {templateUrl: 'partials/movie_list.html', controller: 'MyCtrl1', access:'user'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController',access:'public'});
  $routeProvider.when('/edit', {templateUrl: 'partials/movie_edit.html', controller: 'EditController',access:'admin'});
  $routeProvider.when('/add', {templateUrl: 'partials/movie_edit.html', controller: 'EditController',access:'admin'});
  $routeProvider.otherwise({redirectTo: '/movies'});

}])

    .constant('API_SERVER','http://localhost:8000/');
//.constant('API_SERVER','http://stark-bayou-6519.herokuapp.com/');



