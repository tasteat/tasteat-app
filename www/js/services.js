angular.module('app')
.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])
.factory('Recipe', function($http) {
 return {
  getRecipes: function(searchData) {
    var url = AppSettings.baseApiUrl + '/api/recipes';
    return $http.get(url, {
      params: searchData
    })
      .then(function (response) {
        return response.data;
      }, function (response) {
          console.log('Got Error: ' + JSON.stringify(response));
      })
  },
  getFilters: function(data) {
    var url = AppSettings.baseApiUrl + '/api/filters';
    return $http.get(url, {
      params: data
    })
      .then(function (response) {
        return response.data;
      }, function (response) {
          console.log('Got Error: ' + JSON.stringify(response));
      })
  },
  getRecipe: function(data) {
    var url = AppSettings.baseApiUrl + '/api/get_recipe';
    return $http.get(url, {
      params: data
    })
      .then(function (response) {
        return response.data;
      }, function (response) {
          console.log('Got Error: ' + JSON.stringify(response));
      })
  }
 };
})
.factory('FormData', function() {
 return {
   form: {},
   getForm: function() {
     return this.form;
   },
   updateForm: function(form) {
     this.form = form;
   }
 }
})
