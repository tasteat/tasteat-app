angular.module('app')
.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])
.factory('Recipe', function($http) {
 return {
   getRecipes: function(searchData) {
     var url = AppSettings.baseApiUrl + '/api/recipes?fullText=' + searchData.fullText;
     return $http.get(url)
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
