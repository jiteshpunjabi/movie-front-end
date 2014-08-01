'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

angular.module('JMDB.services', [
    'ngResource'
])
    .factory('Movie',['$resource', function($resource){
    var API_SERVER = 'http://localhost:8000/';
    return $resource('http://localhost',{},{
        getPage:{
            method:'GET',
            url:API_SERVER+'movie/page/:page_no'
        },
        get:{
            method:'GET',
            url:API_SERVER+'movie/:id'
        },
        search:{
            method:'GET',
            url:API_SERVER+'movie\\/'
        },
        create:{
            method:'POST',
            url:API_SERVER+'movie/'
        },
        update:{
            method:'POST',
            url:API_SERVER+'movie/:id'
        },
        delete:{
            method:'DELETE',
            url:API_SERVER+'movie/:id'
        }
    }, {
            stripTrailingSlashes: true
        }
)
}])
    .factory('ShareMovie',function($q, $timeout){
        var data =[

        ];
        return {
            getMovie:function(callback) {
                var temp=data[0];
                data=[];
                return temp;
            },
            addMovie:function(movie){
                data[0]=movie;
            }
        }
    })
.factory('AuthInterceptor', function ($rootScope, $q, $window, $location) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = 'Token ' + $window.localStorage.token;
      }
      return config;
    },

    responseError: function (response) {
      if (response.status === 401) {
        $window.localStorage.removeItem('token');
        $window.localStorage.removeItem('username');
        $location.path('/login');
        return;
      }
      return $q.reject(response);
    }
  };
});
